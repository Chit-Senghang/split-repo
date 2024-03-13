import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateEmployeeWarningDto {
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  warningTypeId: number;

  @IsString()
  @IsNotEmpty()
  warningDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MaxLength(255)
  warningTitle: string;

  @IsOptional()
  @IsArray()
  documentIds: number[];

  @ApiProperty({
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  reason: string;

  @ApiProperty({
    type: Number,
    required: true
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  reasonTemplateId: number;
}
