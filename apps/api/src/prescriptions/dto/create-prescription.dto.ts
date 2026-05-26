import { IsString, IsOptional, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrescriptionItemDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  medication!: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  dosage!: string;

  @ApiProperty({ example: '3x sehari' })
  @IsString()
  frequency!: string;

  @ApiProperty({ example: '5 hari' })
  @IsString()
  duration!: string;

  @ApiPropertyOptional({ example: 'Diminum setelah makan' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'cmpmdpqcl0003...' })
  @IsString()
  appointmentId!: string;

  @ApiPropertyOptional({ example: 'Hindari makanan pedas selama pengobatan' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}
