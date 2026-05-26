import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@sehathub/db';

export class CreatePaymentDto {
  @IsString()
  appointmentId!: string;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsEnum(['IDR', 'USD'])
  currency?: 'IDR' | 'USD';
}
