import { Worker } from 'bullmq';
import { prisma } from './prisma';
import { sendWhatsAppText } from './whatsapp';
import type { ReminderJobData } from './queues';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
};

const WA_TOKEN = process.env.WHATSAPP_API_TOKEN ?? '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';

function buildReminderBody(data: ReminderJobData): string {
  const time = new Date(data.scheduledAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });

  return data.type === '24h'
    ? `Halo ${data.patientName}, ini pengingat janji temu Anda dengan Dr. ${data.doctorName} besok pukul ${time} WIB untuk layanan ${data.serviceName}. Hubungi kami jika ada perubahan rencana.`
    : `Halo ${data.patientName}, janji temu Anda dengan Dr. ${data.doctorName} akan dimulai dalam 1 jam (${time} WIB). Kami tunggu kedatangan Anda! 🏥`;
}

export const reminderWorker = new Worker<ReminderJobData>(
  'appointment-reminders',
  async (job) => {
    const { appointmentId, type, patientPhone } = job.data;

    // Double-check it hasn't already been sent (idempotent)
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      console.log(`[Reminder] Appointment ${appointmentId} not found — skipping`);
      return;
    }
    if (appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW') {
      console.log(`[Reminder] Appointment ${appointmentId} is ${appointment.status} — skipping`);
      return;
    }

    const alreadySent = type === '24h' ? appointment.reminderSent24h : appointment.reminderSent1h;
    if (alreadySent) {
      console.log(`[Reminder] ${type} reminder already sent for ${appointmentId}`);
      return;
    }

    const body = buildReminderBody(job.data);
    await sendWhatsAppText(patientPhone, body, WA_TOKEN, WA_PHONE_ID);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: type === '24h' ? { reminderSent24h: true } : { reminderSent1h: true },
    });

    // Log to whatsapp_messages table
    await prisma.whatsAppMessage.create({
      data: {
        direction: 'OUTBOUND',
        to: patientPhone,
        body,
        type: 'text',
        status: WA_TOKEN ? 'sent' : 'skipped',
        templateName: `appointment_reminder_${type}`,
        appointmentId,
      },
    });

    console.log(`[Reminder] ${type} reminder processed for appointment ${appointmentId}`);
  },
  { connection },
);
