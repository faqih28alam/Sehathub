import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  private format(patient: {
    id: string;
    userId: string;
    user: { name: string; email: string; phone: string | null; isActive: boolean };
    nationality: string | null;
    passportId: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    notes: string | null;
    tags: string[];
    medicalHistoryNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: patient.id,
      userId: patient.userId,
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.user.phone,
      isActive: patient.user.isActive,
      nationality: patient.nationality,
      passportId: patient.passportId,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      notes: patient.notes,
      tags: patient.tags,
      medicalHistoryNotes: patient.medicalHistoryNotes,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  async findAll(query: QueryPatientDto) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, parseInt(query.limit ?? '20'));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      user: { role: 'PATIENT' },
    };

    if (query.search) {
      where.user = {
        role: 'PATIENT',
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
        ],
      };
    }

    if (query.tags) {
      where.tags = { hasSome: query.tags.split(',') };
    }

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients.map(this.format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.format(patient);
  }

  async create(dto: CreatePatientDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash('Patient123!', 10); // temp password, patient should reset

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          phone: dto.phone,
          role: 'PATIENT',
          passwordHash,
        },
      });

      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          nationality: dto.nationality,
          passportId: dto.passportId,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          address: dto.address,
          notes: dto.notes,
          tags: dto.tags ?? [],
          medicalHistoryNotes: dto.medicalHistoryNotes,
        },
        include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
      });

      return this.format(patient);
    });
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({ where: { id }, include: { user: true } });
    if (!patient) throw new NotFoundException('Patient not found');

    const { name, phone, ...patientFields } = dto;

    await this.prisma.$transaction([
      ...(name || phone
        ? [
            this.prisma.user.update({
              where: { id: patient.userId },
              data: { ...(name && { name }), ...(phone && { phone }) },
            }),
          ]
        : []),
      this.prisma.patient.update({
        where: { id },
        data: {
          ...patientFields,
          dateOfBirth: patientFields.dateOfBirth ? new Date(patientFields.dateOfBirth) : undefined,
        },
      }),
    ]);

    return this.findOne(id);
  }

  async getTimeline(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');

    const [appointments, payments] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { patientId: id },
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          service: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
      }),
      this.prisma.payment.findMany({
        where: { patientId: id },
        include: { invoice: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const events = [
      ...appointments.map((a) => ({
        type: 'appointment' as const,
        date: a.scheduledAt,
        data: {
          id: a.id,
          status: a.status,
          doctorName: a.doctor.user.name,
          serviceName: a.service.name,
        },
      })),
      ...payments.map((p) => ({
        type: 'payment' as const,
        date: p.createdAt,
        data: {
          id: p.id,
          status: p.status,
          amountIDR: p.amountIDR,
          invoiceNumber: p.invoice?.invoiceNumber ?? null,
        },
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return events;
  }
}
