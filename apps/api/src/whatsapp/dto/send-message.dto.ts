import { IsString, IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  TEMPLATE = 'template',
}

export class SendMessageDto {
  @ApiProperty({ example: '+628123456789', description: 'Recipient phone in E.164 format' })
  @IsString()
  to!: string;

  @ApiProperty({ example: 'Halo, ada yang bisa kami bantu?', description: 'Message body (for type=text)' })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional({ example: 'appointment_reminder_24h' })
  @IsOptional()
  @IsString()
  templateName?: string;
}
