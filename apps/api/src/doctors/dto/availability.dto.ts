import { IsInt, IsString, IsOptional, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailabilityDto {
  @ApiProperty({ example: 1, description: '0=Sunday, 1=Monday … 6=Saturday', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  dayOfWeek!: number;

  @ApiProperty({ example: '08:00', description: 'HH:MM 24-hour format' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @ApiProperty({ example: '17:00', description: 'HH:MM 24-hour format' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;

  @ApiPropertyOptional({ example: 30, description: 'Slot duration in minutes', minimum: 15 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Type(() => Number)
  slotDurationMinutes?: number;
}

export class UnavailabilityDto {
  @ApiProperty({ example: '2026-06-15', description: 'YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @ApiPropertyOptional({ example: 'National holiday' })
  @IsOptional()
  @IsString()
  reason?: string;
}
