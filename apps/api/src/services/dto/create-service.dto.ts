import { IsString, IsOptional, IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '@sehathub/db';

export class CreateServiceDto {
  @ApiProperty({ example: 'General Consultation' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Standard GP consultation for expats and tourists' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceCategory, example: ServiceCategory.GENERAL_CONSULTATION })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes', minimum: 10 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Type(() => Number)
  durationMinutes?: number;

  @ApiProperty({ example: 350000, description: 'Price in IDR (Rupiah)' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceIDR!: number;

  @ApiPropertyOptional({ example: 25.0, description: 'Price in USD (optional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceUSD?: number;
}
