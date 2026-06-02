import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '@sehathub/db';

export class CreateLeadDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+628123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: LeadSource, example: LeadSource.WHATSAPP })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ example: 'Interested in GP consultation for expat' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'clxyz123', description: 'Assign to admin/doctor userId' })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
