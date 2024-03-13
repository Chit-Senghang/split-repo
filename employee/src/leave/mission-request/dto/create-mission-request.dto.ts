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
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MissionRequestDurationTypeEnEnum } from '../enum/mission-request-duration-type.enum';

export class CreateMissionRequestDto {
  @IsNotEmpty()
  @Min(1)
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @IsIn(Object.keys(MissionRequestDurationTypeEnEnum))
  durationType: MissionRequestDurationTypeEnEnum;

  @IsNotEmpty()
  @IsString()
  fromDate: string;

  @IsNotEmpty()
  @IsString()
  toDate: string;

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
