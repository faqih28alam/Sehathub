// Runs on a cron-like interval — scans upcoming appointments and enqueues reminder jobs
import { prisma } from './prisma';
import { reminderQueue } from './queues';
import type { ReminderJobData } from './queues';

export async function scheduleReminders(): Promise<void> {
  const now = new Date();

  // 24h window: appointments between 23h and 25h from now
  const window24hStart = new Date(now.getTime() + 23 * 3600_000);
  const window24hEnd = new Date(now.getTime() + 25 * 3600_000);

  // 1h window: appointments between 50m and 70m from now
  const window1hStart = new Date(now.getTime() + 50 * 60_000);
  const window1hEnd = new Date(now.getTime() + 70 * 60_000);

  const [upcoming24h, upcoming1h] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: window24hStart, lte: window24hEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW', 'COMPLETED'] },
        reminderSent24h: false,
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        service: { select: { name: true } },
      },
    }),
    prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: window1hStart, lte: window1hEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW', 'COMPLETED'] },
        reminderSent1h: false,
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        service: { select: { name: true } },
      },
    }),
  ]);

  let enqueued = 0;

  for (const appt of upcoming24h) {
    if (!appt.patient.user.phone) continue;
    const jobData: ReminderJobData = {
      appointmentId: appt.id,
      type: '24h',
      patientPhone: appt.patient.user.phone,
      patientName: appt.patient.user.name,
      doctorName: appt.doctor.user.name,
      serviceName: appt.service.name,
      scheduledAt: appt.scheduledAt.toISOString(),
    };
    await reminderQueue.add(`reminder-24h-${appt.id}`, jobData, {
      jobId: `24h-${appt.id}`,   // deduplicate by jobId
      removeOnComplete: true,
      removeOnFail: 50,
    });
    enqueued++;
  }

  for (const appt of upcoming1h) {
    if (!appt.patient.user.phone) continue;
    const jobData: ReminderJobData = {
      appointmentId: appt.id,
      type: '1h',
      patientPhone: appt.patient.user.phone,
      patientName: appt.patient.user.name,
      doctorName: appt.doctor.user.name,
      serviceName: appt.service.name,
      scheduledAt: appt.scheduledAt.toISOString(),
    };
    await reminderQueue.add(`reminder-1h-${appt.id}`, jobData, {
      jobId: `1h-${appt.id}`,
      removeOnComplete: true,
      removeOnFail: 50,
    });
    enqueued++;
  }

  if (enqueued > 0) {
    console.log(`[Scheduler] Enqueued ${enqueued} reminder jobs`);
  }
}
