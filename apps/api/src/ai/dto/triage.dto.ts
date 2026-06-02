import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriageDto {
  @ApiProperty({ example: 'I have a high fever (39°C), severe headache, and stiff neck since this morning.' })
  @IsString()
  @MinLength(10)
  symptoms!: string;

  @ApiProperty({ example: 'en', description: 'Language: en or id', required: false })
  @IsString()
  language?: string = 'en';
}
