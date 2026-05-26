import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AvailabilityDto, UnavailabilityDto } from './dto/availability.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  private format(doctor: {
    id: string;
    userId: string;
    specialization: string | null;
    bio: string | null;
    licenseNumber: string | null;
    yearsOfExperience: number;
    consultationFeeIDR: number | null;
    isAcceptingPatients: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: { name: string; email: string; phone: string | null; isActive: boolean };
  }) {
    return {
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      isActive: doctor.user.isActive,
      specialization: doctor.specialization,
      bio: doctor.bio,
      licenseNumber: doctor.licenseNumber,
      yearsOfExperience: doctor.yearsOfExperience,
      consultationFeeIDR: doctor.consultationFeeIDR,
      isAcceptingPatients: doctor.isAcceptingPatients,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };
  }

  async findAll() {
    const doctors = await this.prisma.doctor.findMany({
      include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return doctors.map(this.format);
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, isActive: true } },
        availability: { orderBy: { dayOfWeek: 'asc' } },
        unavailability: { where: { date: { gte: new Date() } }, orderBy: { date: 'asc' } },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return { ...this.format(doctor), availability: doctor.availability, unavailability: doctor.unavailability };
  }

  async findByUserId(userId: string) {
    return this.prisma.doctor.findUnique({ where: { userId } });
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return this.prisma.doctor.update({ where: { id }, data: dto });
  }

  async setAvailability(doctorId: string, slots: AvailabilityDto[]) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    await this.prisma.$transaction([
      this.prisma.doctorAvailability.deleteMany({ where: { doctorId } }),
      this.prisma.doctorAvailability.createMany({
        data: slots.map((s) => ({ doctorId, ...s, slotDurationMinutes: s.slotDurationMinutes ?? 30 })),
      }),
    ]);

    return this.prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async addUnavailability(doctorId: string, dto: UnavailabilityDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.doctorUnavailability.upsert({
      where: { doctorId_date: { doctorId, date: new Date(dto.date) } },
      update: { reason: dto.reason },
      create: { doctorId, date: new Date(dto.date), reason: dto.reason },
    });
  }

  async removeUnavailability(doctorId: string, unavailabilityId: string) {
    return this.prisma.doctorUnavailability.delete({
      where: { id: unavailabilityId },
    });
  }

  async getAvailableSlots(doctorId: string, dateStr: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { availability: true, unavailability: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    // Check if blocked
    const isUnavailable = doctor.unavailability.some(
      (u) => u.date.toISOString().split('T')[0] === dateStr,
    );
    if (isUnavailable) return [];

    const schedule = doctor.availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!schedule) return [];

    // Generate slots
    const slots: { startTime: string; endTime: string; available: boolean }[] = [];
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const duration = schedule.slotDurationMinutes;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    // Fetch booked appointments for that day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    while (current + duration <= end) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(current / 60), current % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      const isBooked = bookedAppointments.some(
        (a) => a.scheduledAt.getTime() === slotStart.getTime(),
      );

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !isBooked,
      });

      current += duration;
    }

    return slots;
  }
}
