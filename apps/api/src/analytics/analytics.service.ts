import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const weekStart = new Date(todayStart.getTime() - 6 * 86400000); // last 7 days

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      weekAppointments,
      revenueResult,
      weekRevenueRows,
      recentAppointments,
      pendingAppointments,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.doctor.count({ where: { user: { isActive: true } } }),
      this.prisma.appointment.count({
        where: { scheduledAt: { gte: todayStart, lt: todayEnd } },
      }),
      this.prisma.appointment.count({
        where: { scheduledAt: { gte: weekStart, lt: todayEnd } },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amountIDR: true },
      }),
      this.prisma.payment.findMany({
        where: { status: 'PAID', createdAt: { gte: weekStart, lt: todayEnd } },
        select: { amountIDR: true, createdAt: true },
      }),
      this.prisma.appointment.findMany({
        orderBy: { scheduledAt: 'desc' },
        take: 5,
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
          service: { select: { name: true } },
        },
      }),
      this.prisma.appointment.count({ where: { status: 'PENDING' } }),
    ]);

    // Aggregate revenue per day for the last 7 days
    const dailyRevenue = this.buildDailyRevenue(weekRevenueRows, weekStart);

    return {
      totalPatients,
      totalDoctors,
      todayAppointments,
      weekAppointments,
      pendingAppointments,
      totalRevenueIDR: revenueResult._sum.amountIDR ?? 0,
      weekRevenue: dailyRevenue,
      recentAppointments: recentAppointments.map((a) => ({
        id: a.id,
        patientName: a.patient.user.name,
        doctorName: a.doctor.user.name,
        serviceName: a.service.name,
        scheduledAt: a.scheduledAt,
        status: a.status,
        type: a.type,
      })),
    };
  }

  private buildDailyRevenue(
    rows: { amountIDR: number; createdAt: Date }[],
    weekStart: Date,
  ) {
    const days: { date: string; revenueIDR: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime() + i * 86400000);
      const label = d.toISOString().slice(0, 10);
      const total = rows
        .filter((r) => r.createdAt.toISOString().slice(0, 10) === label)
        .reduce((sum, r) => sum + r.amountIDR, 0);
      days.push({ date: label, revenueIDR: total });
    }
    return days;
  }
}
