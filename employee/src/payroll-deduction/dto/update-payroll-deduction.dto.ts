import { PartialType } from '@nestjs/swagger';
import { CreatePayrollDeductionDto } from './create-payroll-deduction.dto';

export class UpdatePayrollDeductionDto extends PartialType(
  CreatePayrollDeductionDto
) {}
