import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqItemDto {
  @ApiProperty({ example: 'How do I book an appointment?' })
  @IsString()
  question!: string;

  @ApiProperty({ example: 'You can book via our website or by WhatsApp at +62-xxx-xxxx.' })
  @IsString()
  answer!: string;

  @ApiPropertyOptional({ example: 'booking' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateFaqItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
