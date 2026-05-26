import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({ example: 'MyPassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
