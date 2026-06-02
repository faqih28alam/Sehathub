import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiToken: string;
  private readonly phoneNumberId: string;
  private readonly verifyToken: string;
  private readonly apiBase = 'https://graph.facebook.com/v19.0';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.apiToken = this.config.get<string>('WHATSAPP_API_TOKEN', '');
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
    this.verifyToken = this.config.get<string>('WHATSAPP_VERIFY_TOKEN', 'sehathub-verify');
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) return challenge;
    return null;
  }

  async handleInbound(body: Record<string, unknown>) {
    try {
      const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
      const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
      const value = changes?.value as Record<string, unknown> | undefined;
      const messages = value?.messages as Array<Record<string, unknown>> | undefined;

      if (!messages?.length) return;

      for (const msg of messages) {
        const waId = msg.id as string;
        const from = msg.from as string;
        const text = (msg.text as Record<string, string> | undefined)?.body ?? '';

        await this.prisma.whatsAppMessage.upsert({
          where: { waMessageId: waId },
          update: {},
          create: {
            direction: 'INBOUND',
            from,
            body: text,
            type: 'text',
            status: 'received',
            waMessageId: waId,
          },
        });
        this.logger.log(`Inbound WA from ${from}: ${text.slice(0, 60)}`);
      }
    } catch (err) {
      this.logger.error('Error processing inbound webhook', err);
    }
  }

  async sendText(to: string, body: string, appointmentId?: string): Promise<string | null> {
    if (!this.apiToken || !this.phoneNumberId) {
      this.logger.warn(`WA not configured — skipping send to ${to}`);
      const record = await this.prisma.whatsAppMessage.create({
        data: { direction: 'OUTBOUND', to, body, type: 'text', status: 'skipped', appointmentId },
      });
      return record.id;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body },
    };

    try {
      const res = await fetch(`${this.apiBase}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as Record<string, unknown>;
      const waMessageId = (data.messages as Array<{ id: string }>)?.[0]?.id;

      const record = await this.prisma.whatsAppMessage.create({
        data: {
          direction: 'OUTBOUND',
          to,
          body,
          type: 'text',
          status: res.ok ? 'sent' : 'failed',
          waMessageId,
          appointmentId,
        },
      });

      if (!res.ok) this.logger.error(`WA send failed to ${to}:`, data);
      return record.id;
    } catch (err) {
      this.logger.error(`WA send error to ${to}:`, err);
      await this.prisma.whatsAppMessage.create({
        data: { direction: 'OUTBOUND', to, body, type: 'text', status: 'failed', appointmentId },
      });
      return null;
    }
  }

  async getMessages(query: { direction?: string; page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, parseInt(query.limit ?? '20'));
    const skip = (page - 1) * limit;

    const where = query.direction ? { direction: query.direction } : {};

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.whatsAppMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppMessage.count({ where }),
    ]);

    return { data: messages, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Called by BullMQ worker — send 24h reminder
  async sendAppointmentReminder(
    appointmentId: string,
    type: '24h' | '1h',
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        service: { select: { name: true } },
      },
    });

    if (!appointment || !appointment.patient.user.phone) return;
    if (appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW') return;

    const alreadySent = type === '24h' ? appointment.reminderSent24h : appointment.reminderSent1h;
    if (alreadySent) return;

    const time = appointment.scheduledAt.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });

    const body =
      type === '24h'
        ? `Halo ${appointment.patient.user.name}, ini pengingat janji temu Anda dengan Dr. ${appointment.doctor.user.name} besok pukul ${time} WIB untuk layanan ${appointment.service.name}. Hubungi kami jika ada perubahan rencana.`
        : `Halo ${appointment.patient.user.name}, janji temu Anda dengan Dr. ${appointment.doctor.user.name} akan dimulai dalam 1 jam (${time} WIB). Kami tunggu kedatangan Anda!`;

    await this.sendText(appointment.patient.user.phone, body, appointmentId);

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: type === '24h' ? { reminderSent24h: true } : { reminderSent1h: true },
    });
  }
}
