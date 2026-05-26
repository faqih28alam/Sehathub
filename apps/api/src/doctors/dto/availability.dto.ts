import { IsInt, IsString, IsOptional, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  dayOfWeek!: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Type(() => Number)
  slotDurationMinutes?: number;
}

export class UnavailabilityDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
