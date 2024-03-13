import { PartialType } from '@nestjs/swagger';
import { CreatePayrollDeductionTypeDto } from './create-payroll-deduction-type.dto';

export class UpdatePayrollDeductionTypeDto extends PartialType(
  CreatePayrollDeductionTypeDto
) {}
