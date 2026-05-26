import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'WELCOME20' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: 20, description: 'Discount percentage (1–100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Fixed discount in IDR' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  discountIDR?: number;

  @ApiPropertyOptional({ example: 100, description: 'Max number of redemptions' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxUses?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
