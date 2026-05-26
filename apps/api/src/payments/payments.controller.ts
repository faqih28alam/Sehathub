import {
  Controller, Get, Post, Body, Query, Headers, RawBodyRequest, Req,
  UseGuards, HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RecordManualPaymentDto } from './dto/manual-payment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll(@Query() query: { patientId?: string; status?: string; page?: string; limit?: string }) {
    return this.payments.findAll(query);
  }

  @Post('midtrans/charge')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PATIENT')
  initiateMidtrans(@Body() dto: CreatePaymentDto) {
    return this.payments.initiateMidtrans(dto);
  }

  @Post('stripe/charge')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PATIENT')
  initiateStripe(@Body() dto: CreatePaymentDto) {
    return this.payments.initiateStripe(dto);
  }

  @Post('manual')
  @Roles('SUPER_ADMIN', 'ADMIN')
  recordManual(@Body() dto: RecordManualPaymentDto, @CurrentUser() user: JwtPayload) {
    return this.payments.recordManual(dto, user.sub);
  }

  @Post('webhooks/midtrans')
  @Public()
  @HttpCode(200)
  midtransWebhook(@Body() body: Record<string, string>) {
    return this.payments.handleMidtransWebhook(body);
  }

  @Post('webhooks/stripe')
  @Public()
  @HttpCode(200)
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.payments.handleStripeWebhook(req.rawBody!, sig);
  }
}
