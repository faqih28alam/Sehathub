import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
};

export const reminderQueue = new Queue('appointment-reminders', { connection });

export type ReminderJobData = {
  appointmentId: string;
  type: '24h' | '1h';
  patientPhone: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  scheduledAt: string;
};
