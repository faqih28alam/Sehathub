import { IsOptional, IsString, IsEnum, IsInt, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '@sehathub/db';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'General Consultation' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional({ example: 45, minimum: 10 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Type(() => Number)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 400000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceIDR?: number;

  @ApiPropertyOptional({ example: 28.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceUSD?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
