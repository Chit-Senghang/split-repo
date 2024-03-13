import { PartialType } from '@nestjs/swagger';
import { CreateSalaryTaxWithheldRankDto } from './create-salary-tax-withheld-rank.dto';

export class UpdateSalaryTaxWithheldRankDto extends PartialType(
  CreateSalaryTaxWithheldRankDto
) {}
