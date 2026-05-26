import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoCodeDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  discountPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  discountIDR?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
