import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AppointmentType } from '@sehathub/db';

export class CreateAppointmentDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsString()
  serviceId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;
}
