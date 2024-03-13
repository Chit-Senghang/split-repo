import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidTime } from '../../../shared-resources/decorator/validateTime';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';

export class CreateMissedScanRequestDto {
  @ApiProperty({
    type: Number,
    description: 'number is greater than one',
    required: true
  })
  @IsNotEmpty()
  @Min(1)
  @IsInt()
  employeeId: number;

  @ApiProperty({
    type: Boolean,
    required: true
  })
  @IsNotEmpty()
  requestDate: string;

  @ApiProperty({
    type: String,
    required: true
  })
  @IsNotEmpty()
  @IsValidTime()
  scanTime: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: StatusEnum
  })
  @IsOptional()
  @IsIn(Object.keys(StatusEnum))
  status: StatusEnum;

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
