import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeWarningDto } from './create-employee-warning.dto';

export class UpdateEmployeeWarningDto extends PartialType(
  CreateEmployeeWarningDto
) {}
