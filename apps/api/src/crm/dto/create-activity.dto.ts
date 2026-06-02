import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const ACTIVITY_TYPES = ['call', 'email', 'whatsapp', 'note', 'meeting'] as const;

export class CreateActivityDto {
  @ApiProperty({ enum: ACTIVITY_TYPES, example: 'call' })
  @IsString()
  @IsIn(ACTIVITY_TYPES)
  type!: string;

  @ApiProperty({ example: 'Called patient, interested in GP consultation next week' })
  @IsString()
  notes!: string;
}
