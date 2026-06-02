import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FaqQueryDto {
  @ApiProperty({ example: 'What payment methods do you accept?' })
  @IsString()
  @MinLength(3)
  question!: string;
}
