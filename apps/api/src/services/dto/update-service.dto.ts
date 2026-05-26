import { IsOptional, IsString, IsEnum, IsInt, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '@sehathub/db';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Type(() => Number)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceIDR?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceUSD?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
