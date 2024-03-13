import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

export class CreateSalaryComponentTypeDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'name is string'
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage: number;
}
