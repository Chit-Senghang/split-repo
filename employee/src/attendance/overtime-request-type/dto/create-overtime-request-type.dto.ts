import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreateOvertimeRequestTypeDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'MaxLength 255'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: Number,
    required: true
  })
  @IsNotEmpty()
  @IsNumber()
  percentagePerHour: number;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  description: string;
}
