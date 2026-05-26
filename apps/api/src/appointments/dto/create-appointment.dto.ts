import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType } from '@sehathub/db';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'cmpmdpqcl0000...' })
  @IsString()
  patientId!: string;

  @ApiProperty({ example: 'cmpmdpqcl0001...' })
  @IsString()
  doctorId!: string;

  @ApiProperty({ example: 'cmpmdpqcl0002...' })
  @IsString()
  serviceId!: string;

  @ApiProperty({ example: '2026-06-01T09:00:00.000Z' })
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional({ enum: AppointmentType, example: AppointmentType.IN_PERSON })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;
}
