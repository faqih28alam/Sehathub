import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@sehathub/db';

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Patient presents with mild fever and sore throat.' })
  @IsOptional()
  @IsString()
  consultationNotes?: string;

  @ApiPropertyOptional({ example: 'Patient requested rescheduling' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
