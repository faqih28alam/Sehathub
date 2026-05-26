import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '@sehathub/db';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @IsOptional()
  @IsString()
  consultationNotes?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
