import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteDoctorDto {
  @ApiProperty({ example: 'dr.smith@sehathub.id' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Dr. John Smith' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '+628123456789' })
  @IsString()
  @IsOptional()
  phone?: string;
}
