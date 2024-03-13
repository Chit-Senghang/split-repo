import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { CreateLeaveRequestVariationDto } from './create-leave-request-variation.dto';

export class LeaveTypeDto extends AuditBaseEntity {
  @IsOptional()
  @IsBoolean()
  isGenerateLeaveStock: boolean;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  leaveTypeName: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  leaveTypeNameKh: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  incrementRule: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  incrementAllowance: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coverFrom: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requiredDoc: number;

  @IsBoolean()
  @IsOptional()
  carryForwardStatus: boolean;

  @IsOptional()
  @IsNumber()
  carryForwardAllowance: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLeaveRequestVariationDto)
  leaves: CreateLeaveRequestVariationDto[];

  @IsOptional()
  @IsBoolean()
  isPublicHoliday: boolean;
}
