import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePayrollBenefitAdjustmentDetailDto } from './create-payroll-benefit-adjustment-detail.dto';

export class CreatePayrollBenefitAdjustmentDto {
  @IsNumber()
  @Min(1)
  adjustmentTypeId: number;

  @IsOptional()
  @IsString()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  employeeId: number;

  @IsOptional()
  @Min(1)
  @IsInt()
  employeeMovementId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreatePayrollBenefitAdjustmentDetailDto)
  detail: CreatePayrollBenefitAdjustmentDetailDto[];
}
