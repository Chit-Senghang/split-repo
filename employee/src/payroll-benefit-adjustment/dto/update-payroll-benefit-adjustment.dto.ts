import { PartialType } from '@nestjs/swagger';
import { CreatePayrollBenefitAdjustmentDto } from './create-payroll-benefit-adjustment.dto';

export class UpdatePayrollBenefitAdjustmentDto extends PartialType(
  CreatePayrollBenefitAdjustmentDto
) {}
