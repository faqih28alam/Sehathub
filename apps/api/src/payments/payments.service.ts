import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RecordManualPaymentDto } from './dto/manual-payment.dto';
import { PaymentMethod, PaymentStatus } from '@sehathub/db';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MidtransClient = require('midtrans-client');

@Injectable()
export class PaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stripe: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private midtransSnap: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private servicesService: ServicesService,
  ) {
    this.stripe = new StripeLib(this.config.get<string>('STRIPE_SECRET_KEY', ''), {
      apiVersion: '2026-04-22.dahlia',
    });

    this.midtransSnap = new MidtransClient.Snap({
      isProduction: this.config.get('NODE_ENV') === 'production',
      serverKey: this.config.get<string>('MIDTRANS_SERVER_KEY', ''),
      clientKey: this.config.get<string>('MIDTRANS_CLIENT_KEY', ''),
    });
  }

  private async getAppointmentAndPrice(appointmentId: string, promoCode?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status === 'CANCELLED') throw new BadRequestException('Appointment is cancelled');

    const existingPayment = await this.prisma.payment.findUnique({ where: { appointmentId } });
    if (existingPayment && existingPayment.status === 'PAID') {
      throw new ConflictException('Appointment already paid');
    }

    let amountIDR = appointment.service.priceIDR;
    let promoCodeId: string | undefined;

    if (promoCode) {
      const result = await this.servicesService.validatePromoCode(promoCode, amountIDR);
      amountIDR = result.finalAmountIDR;
      promoCodeId = result.promoId;
    }

    return { appointment, amountIDR, promoCodeId };
  }

  async initiateMidtrans(dto: CreatePaymentDto) {
    const { appointment, amountIDR, promoCodeId } = await this.getAppointmentAndPrice(
      dto.appointmentId,
      dto.promoCode,
    );

    const orderId = `SHB-${appointment.id}-${Date.now()}`;

    const transaction = await this.midtransSnap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: amountIDR },
      customer_details: {
        first_name: appointment.patient.user.name,
        email: appointment.patient.user.email,
        phone: appointment.patient.user.phone,
      },
      item_details: [
        { id: appointment.serviceId, price: amountIDR, quantity: 1, name: appointment.service.name },
      ],
    });

    await this.prisma.payment.upsert({
      where: { appointmentId: dto.appointmentId },
      update: { gatewayOrderId: orderId, amountIDR, promoCodeId },
      create: {
        appointmentId: dto.appointmentId,
        patientId: appointment.patientId,
        amountIDR,
        currency: 'IDR',
        method: PaymentMethod.MIDTRANS,
        status: PaymentStatus.PENDING,
        gatewayOrderId: orderId,
        promoCodeId,
      },
    });

    return { token: transaction.token, redirectUrl: transaction.redirect_url };
  }

  async initiateStripe(dto: CreatePaymentDto) {
    const { appointment, amountIDR, promoCodeId } = await this.getAppointmentAndPrice(
      dto.appointmentId,
      dto.promoCode,
    );

    const amountUSD = appointment.service.priceUSD ?? amountIDR / 16000;
    const amountCents = Math.round(amountUSD * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { appointmentId: dto.appointmentId },
    });

    await this.prisma.payment.upsert({
      where: { appointmentId: dto.appointmentId },
      update: { gatewayOrderId: paymentIntent.id, amountIDR, amountUSD, promoCodeId },
      create: {
        appointmentId: dto.appointmentId,
        patientId: appointment.patientId,
        amountIDR,
        amountUSD,
        currency: 'USD',
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
        gatewayOrderId: paymentIntent.id,
        promoCodeId,
      },
    });

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  async recordManual(dto: RecordManualPaymentDto, actorId: string) {
    const { appointment, amountIDR, promoCodeId } = await this.getAppointmentAndPrice(
      dto.appointmentId,
      dto.promoCode,
    );

    const payment = await this.prisma.payment.upsert({
      where: { appointmentId: dto.appointmentId },
      update: {
        amountIDR: dto.amountIDR,
        method: dto.method as PaymentMethod,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        notes: dto.notes,
        promoCodeId,
      },
      create: {
        appointmentId: dto.appointmentId,
        patientId: appointment.patientId,
        amountIDR: dto.amountIDR,
        currency: 'IDR',
        method: dto.method as PaymentMethod,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        notes: dto.notes,
        promoCodeId,
      },
    });

    await this.issueInvoice(payment.id);

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'payment.record_manual',
        entityType: 'Payment',
        entityId: payment.id,
        after: { amountIDR: dto.amountIDR, method: dto.method },
      },
    });

    return payment;
  }

  async handleMidtransWebhook(body: Record<string, string>) {
    const { order_id, transaction_status, fraud_status } = body;

    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: order_id },
    });
    if (!payment) return;

    let newStatus: PaymentStatus | null = null;
    if (
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement'
    ) {
      newStatus = PaymentStatus.PAID;
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = PaymentStatus.FAILED;
    } else if (transaction_status === 'refund') {
      newStatus = PaymentStatus.REFUNDED;
    }

    if (!newStatus) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        gatewayResponse: body as never,
        ...(newStatus === PaymentStatus.PAID && { paidAt: new Date() }),
        ...(newStatus === PaymentStatus.REFUNDED && { refundedAt: new Date() }),
      },
    });

    if (newStatus === PaymentStatus.PAID) {
      await this.issueInvoice(payment.id);
    }
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const payment = await this.prisma.payment.findFirst({
        where: { gatewayOrderId: intent.id },
      });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PAID, paidAt: new Date(), gatewayPaymentId: intent.id },
        });
        await this.issueInvoice(payment.id);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      await this.prisma.payment.updateMany({
        where: { gatewayOrderId: intent.id },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }

  private async issueInvoice(paymentId: string) {
    const existing = await this.prisma.invoice.findUnique({ where: { paymentId } });
    if (existing) return existing;

    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.invoice.create({
      data: { paymentId, invoiceNumber },
    });
  }

  async findAll(query: { patientId?: string; status?: string; page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, parseInt(query.limit ?? '20'));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: {
          patient: { include: { user: { select: { name: true } } } },
          invoice: { select: { invoiceNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => ({
        ...p,
        patientName: p.patient.user.name,
        invoiceNumber: p.invoice?.invoiceNumber ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
