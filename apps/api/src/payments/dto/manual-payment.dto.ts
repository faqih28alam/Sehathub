import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordManualPaymentDto {
  @IsString()
  appointmentId!: string;

  @IsEnum(['CASH', 'BANK_TRANSFER'])
  method!: 'CASH' | 'BANK_TRANSFER';

  @IsInt()
  @Min(0)
  @Type(() => Number)
  amountIDR!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}
