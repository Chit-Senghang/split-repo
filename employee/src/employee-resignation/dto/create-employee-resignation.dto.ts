import {
  Min,
  IsNotEmpty,
  IsInt,
  IsString,
  IsIn,
  IsOptional,
  IsArray,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';

export class CreateEmployeeResignationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  resignTypeId: number;

  @IsString()
  @IsNotEmpty()
  resignDate: string;

  @IsOptional()
  @IsIn(Object.keys(StatusEnum))
  status: StatusEnum;

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
