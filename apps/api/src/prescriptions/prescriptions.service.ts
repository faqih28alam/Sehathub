import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtPayload } from '@sehathub/types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  private format(p: {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    notes: string | null;
    pdfUrl: string | null;
    issuedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    patient: { user: { name: string } };
    doctor: { user: { name: string } };
    items: Array<{
      id: string;
      prescriptionId: string;
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes: string | null;
    }>;
  }) {
    return {
      id: p.id,
      appointmentId: p.appointmentId,
      patientId: p.patientId,
      patientName: p.patient.user.name,
      doctorId: p.doctorId,
      doctorName: p.doctor.user.name,
      notes: p.notes,
      pdfUrl: p.pdfUrl,
      issuedAt: p.issuedAt,
      createdAt: p.createdAt,
      items: p.items,
    };
  }

  private get include() {
    return {
      patient: { include: { user: { select: { name: true } } } },
      doctor: {
        include: {
          user: { select: { name: true } },
        },
      },
      items: true,
    } as const;
  }

  async create(dto: CreatePrescriptionDto, actor: JwtPayload) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { doctor: { include: { user: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Doctors can only prescribe for their own appointments
    if (actor.role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId: actor.sub } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        throw new ForbiddenException('You can only create prescriptions for your own appointments');
      }
    }

    const existing = await this.prisma.prescription.findUnique({
      where: { appointmentId: dto.appointmentId },
    });
    if (existing) throw new ConflictException('Prescription already exists for this appointment');

    const prescription = await this.prisma.prescription.create({
      data: {
        appointmentId: dto.appointmentId,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        notes: dto.notes,
        items: { create: dto.items },
      },
      include: {
        ...this.include,
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Generate PDF asynchronously (don't block the response)
    this.generateAndStorePdf(prescription.id).catch(console.error);

    return this.format(prescription as Parameters<typeof this.format>[0]);
  }

  async findAll(query: { patientId?: string; doctorId?: string; page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, parseInt(query.limit ?? '20'));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;

    const [prescriptions, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where,
        include: this.include,
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      data: prescriptions.map((p) => this.format(p as Parameters<typeof this.format>[0])),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: this.include,
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return this.format(prescription as Parameters<typeof this.format>[0]);
  }

  async findByPatient(patientId: string) {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      include: this.include,
      orderBy: { issuedAt: 'desc' },
    });
    return prescriptions.map((p) => this.format(p as Parameters<typeof this.format>[0]));
  }

  async getPdf(id: string): Promise<Buffer> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
        items: true,
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');

    // Return stored PDF if it exists
    if (prescription.pdfUrl) {
      const filePath = path.join(process.cwd(), prescription.pdfUrl);
      if (fs.existsSync(filePath)) {
        return fs.promises.readFile(filePath);
      }
    }

    // Generate on the fly
    return this.generatePdfBuffer(prescription);
  }

  private async generatePdfBuffer(prescription: {
    id: string;
    notes: string | null;
    issuedAt: Date;
    patient: { user: { name: string }; nationality?: string | null };
    doctor: { specialization?: string | null; user: { name: string } };
    items: Array<{ medication: string; dosage: string; frequency: string; duration: string; notes: string | null }>;
  }) {
    return this.pdfService.generatePrescriptionPdf({
      prescriptionId: prescription.id,
      patientName: prescription.patient.user.name,
      patientNationality: prescription.patient.nationality ?? null,
      doctorName: prescription.doctor.user.name,
      doctorSpecialization: prescription.doctor.specialization ?? null,
      issuedAt: prescription.issuedAt,
      notes: prescription.notes,
      items: prescription.items,
    });
  }

  private async generateAndStorePdf(prescriptionId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        items: true,
      },
    });
    if (!prescription) return;

    const pdfBuffer = await this.generatePdfBuffer(prescription);

    // Store in uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `prescription-${prescriptionId}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, pdfBuffer);

    await this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: { pdfUrl: `uploads/prescriptions/${filename}` },
    });
  }
}
