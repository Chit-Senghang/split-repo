import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LeaveRequestDurationTypeEnEnum } from '../enums/leave-request-duration-type.enum';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @Min(1)
  @IsInt()
  leaveRequestTypeId: number;

  @IsNotEmpty()
  @IsIn(Object.keys(LeaveRequestDurationTypeEnEnum))
  durationType: LeaveRequestDurationTypeEnEnum;

  @IsNotEmpty()
  @IsString()
  fromDate: string;

  @IsNotEmpty()
  @IsString()
  toDate: string;

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

  @ApiProperty({
    type: Boolean,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isPublicHoliday: boolean;

  @ApiProperty({
    type: Boolean,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isSpecialLeave: boolean;

  @ApiProperty({
    type: Number,
    required: false
  })
  @IsNumber()
  @IsOptional()
  leaveDuration?: number;
}
