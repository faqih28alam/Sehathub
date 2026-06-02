import 'dotenv/config';
import { reminderWorker } from './reminder.processor';
import { scheduleReminders } from './scheduler';

const SCHEDULE_INTERVAL_MS = 30 * 60 * 1000; // every 30 minutes

async function main() {
  console.log('[Workers] SehatHub worker process starting...');

  await scheduleReminders();
  const interval = setInterval(scheduleReminders, SCHEDULE_INTERVAL_MS);

  reminderWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  reminderWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  process.on('SIGTERM', async () => {
    console.log('[Workers] Shutting down...');
    clearInterval(interval);
    await reminderWorker.close();
    process.exit(0);
  });

  console.log(`[Workers] Running — checking reminders every ${SCHEDULE_INTERVAL_MS / 60000}m`);
}

main().catch((err) => {
  console.error('[Workers] Fatal error:', err);
  process.exit(1);
});
