import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'General Practitioner' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: '10 years of experience in family medicine' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'SIP-123/2024' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 150000, description: 'Consultation fee in IDR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFeeIDR?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAcceptingPatients?: boolean;
}
