import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { AppointmentType } from '@sehathub/db';

const INCLUDE = {
  patient: { include: { user: { select: { name: true } } } },
  doctor: { include: { user: { select: { name: true } } } },
  service: { select: { name: true, durationMinutes: true } },
} as const;

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private format(a: {
    id: string;
    patientId: string;
    doctorId: string;
    serviceId: string;
    scheduledAt: Date;
    endsAt: Date;
    status: string;
    type: string;
    consultationNotes: string | null;
    cancellationReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    patient: { user: { name: string } };
    doctor: { user: { name: string } };
    service: { name: string };
  }) {
    return {
      id: a.id,
      patientId: a.patientId,
      patientName: a.patient.user.name,
      doctorId: a.doctorId,
      doctorName: a.doctor.user.name,
      serviceId: a.serviceId,
      serviceName: a.service.name,
      scheduledAt: a.scheduledAt,
      endsAt: a.endsAt,
      status: a.status,
      type: a.type,
      consultationNotes: a.consultationNotes,
      cancellationReason: a.cancellationReason,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async findAll(query: QueryAppointmentDto) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, parseInt(query.limit ?? '20'));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.scheduledAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    const [appointments, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: INCLUDE,
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments.map(this.format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const a = await this.prisma.appointment.findUnique({ where: { id }, include: INCLUDE });
    if (!a) throw new NotFoundException('Appointment not found');
    return this.format(a);
  }

  async create(dto: CreateAppointmentDto) {
    // Verify patient, doctor, service exist
    const [patient, doctor, service] = await Promise.all([
      this.prisma.patient.findUnique({ where: { id: dto.patientId } }),
      this.prisma.doctor.findUnique({ where: { id: dto.doctorId } }),
      this.prisma.service.findUnique({ where: { id: dto.serviceId } }),
    ]);
    if (!patient) throw new NotFoundException('Patient not found');
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!service) throw new NotFoundException('Service not found');

    const scheduledAt = new Date(dto.scheduledAt);
    const endsAt = new Date(scheduledAt.getTime() + service.durationMinutes * 60000);

    // Check double-booking: doctor cannot have overlapping active appointments
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { scheduledAt: { lt: endsAt }, endsAt: { gt: scheduledAt } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Doctor already has an appointment in this time slot');

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        serviceId: dto.serviceId,
        scheduledAt,
        endsAt,
        type: dto.type ?? AppointmentType.IN_PERSON,
      },
      include: INCLUDE,
    });

    return this.format(appointment);
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Enforce status transition rules
    const allowed: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!allowed[appointment.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${appointment.status} to ${dto.status}`,
      );
    }

    if (dto.status === 'CANCELLED' && !dto.cancellationReason) {
      throw new BadRequestException('Cancellation reason is required');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: dto.status as never,
        ...(dto.consultationNotes && { consultationNotes: dto.consultationNotes }),
        ...(dto.cancellationReason && { cancellationReason: dto.cancellationReason }),
      },
      include: INCLUDE,
    });

    return this.format(updated);
  }
}
