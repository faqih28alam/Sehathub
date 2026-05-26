import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFeeIDR?: number;

  @IsOptional()
  @IsBoolean()
  isAcceptingPatients?: boolean;
}
