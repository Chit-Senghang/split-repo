import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import { AdjustmentDetailStatusEnum } from '../enum/status.enum';

export class CreatePayrollBenefitAdjustmentDetailDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  id: number;

  @IsInt()
  @Min(1)
  benefitComponentId: number;

  @IsOptional()
  @IsString()
  effectiveDateFrom: Date;

  @IsOptional()
  @IsString()
  effectiveDateTo: Date;

  @IsNotEmpty()
  @IsNumber()
  adjustAmount: number;

  @IsBoolean()
  @IsOptional()
  isPostProbation: boolean;

  @IsIn(Object.values(AdjustmentDetailStatusEnum))
  @IsOptional()
  status: AdjustmentDetailStatusEnum;
}
