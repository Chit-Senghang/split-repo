import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ example: 'admin@gmail.com' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  password: string;
}
