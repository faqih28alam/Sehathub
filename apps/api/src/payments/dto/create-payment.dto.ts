import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@sehathub/db';

export class CreatePaymentDto {
  @ApiProperty({ example: 'cmpmdpqcl0003...' })
  @IsString()
  appointmentId!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MIDTRANS })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: 'WELCOME20' })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiPropertyOptional({ enum: ['IDR', 'USD'], example: 'IDR' })
  @IsOptional()
  @IsEnum(['IDR', 'USD'])
  currency?: 'IDR' | 'USD';
}
