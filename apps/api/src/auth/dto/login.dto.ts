import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'superadmin@sehathub.id' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SuperAdmin123!' })
  @IsString()
  password!: string;
}
