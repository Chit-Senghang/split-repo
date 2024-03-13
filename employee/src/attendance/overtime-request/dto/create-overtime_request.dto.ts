import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_HOUR_MINUTE_FORMAT
} from '../../../shared-resources/common/dto/default-date-format';
import { OvertimeTypeEnum } from '../../../shared-resources/common/enums/overtime-type.enum';

export class CreateOvertimeRequestDto {
  @ApiProperty({
    type: Number,
    required: true
  })
  @IsNotEmpty()
  @Min(1)
  @IsInt()
  employeeId: number;

  @ApiProperty({
    type: Date,
    required: true,
    description: `Format (${DEFAULT_DATE_FORMAT})`
  })
  @IsNotEmpty()
  @IsString()
  requestDate: string;

  @ApiProperty({
    type: Date,
    required: true,
    description: `Format ${DEFAULT_HOUR_MINUTE_FORMAT}`,
    example: '8:00'
  })
  @IsOptional()
  @IsString()
  startTime: string;

  @ApiProperty({
    type: Date,
    required: true,
    description: `Format ${DEFAULT_HOUR_MINUTE_FORMAT}`,
    example: '17:00'
  })
  @IsOptional()
  @IsString()
  endTime: string;

  @ApiProperty({
    type: String,
    required: true
  })
  @IsOptional()
  @IsIn(Object.values(OvertimeTypeEnum))
  overtimeType: OvertimeTypeEnum;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  reason: string;

  @IsOptional()
  @IsArray()
  documentIds: number[];

  @ApiProperty({
    type: Number,
    required: true
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  reasonTemplateId: number;
}
