import { PartialType } from '@nestjs/swagger';
import { CreatePayrollGenerationDto } from './create-payroll-generation.dto';

export class UpdatePayrollGenerationDto extends PartialType(
  CreatePayrollGenerationDto
) {}
