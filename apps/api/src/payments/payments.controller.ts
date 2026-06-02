import {
  Controller, Get, Post, Body, Query, Headers, RawBodyRequest, Req,
  UseGuards, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RecordManualPaymentDto } from './dto/manual-payment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @ApiOperation({ summary: 'List payments (Admin only)' })
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll(@Query() query: { patientId?: string; status?: string; page?: string; limit?: string }) {
    const data = await this.payments.findAll(query);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Initiate Midtrans payment (returns Snap token)' })
  @Post('midtrans/charge')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PATIENT')
  async initiateMidtrans(@Body() dto: CreatePaymentDto) {
    const data = await this.payments.initiateMidtrans(dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Initiate Stripe payment (returns client_secret)' })
  @Post('stripe/charge')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PATIENT')
  async initiateStripe(@Body() dto: CreatePaymentDto) {
    const data = await this.payments.initiateStripe(dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Record a cash/bank transfer payment (Admin only)' })
  @Post('manual')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async recordManual(@Body() dto: RecordManualPaymentDto, @CurrentUser() user: JwtPayload) {
    const data = await this.payments.recordManual(dto, user.sub);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Midtrans payment notification webhook (called by Midtrans)' })
  @Post('webhooks/midtrans')
  @Public()
  @HttpCode(200)
  midtransWebhook(@Body() body: Record<string, string>) {
    return this.payments.handleMidtransWebhook(body);
  }

  @ApiOperation({ summary: 'Stripe payment event webhook (called by Stripe)' })
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
