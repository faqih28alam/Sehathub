import { IsString, IsOptional, IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '@sehathub/db';

export class CreateServiceDto {
  @IsString()
  name!: string;

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

  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceIDR!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceUSD?: number;
}
