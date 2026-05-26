import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordManualPaymentDto {
  @ApiProperty({ example: 'cmpmdpqcl0003...' })
  @IsString()
  appointmentId!: string;

  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER'], example: 'CASH' })
  @IsEnum(['CASH', 'BANK_TRANSFER'])
  method!: 'CASH' | 'BANK_TRANSFER';

  @ApiProperty({ example: 350000, description: 'Amount paid in IDR' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  amountIDR!: number;

  @ApiPropertyOptional({ example: 'Paid at front desk' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'WELCOME20' })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
