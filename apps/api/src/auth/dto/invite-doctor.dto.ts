import { IsEmail, IsOptional, IsString } from 'class-validator';

export class InviteDoctorDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
