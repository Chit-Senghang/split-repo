import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaryComponentTypeDto } from './create-benefit-component-type.dto';

export class UpdateSalaryComponentTypeDto extends PartialType(
  CreateSalaryComponentTypeDto
) {}
