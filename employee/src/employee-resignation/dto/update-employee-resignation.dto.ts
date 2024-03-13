import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeResignationDto } from './create-employee-resignation.dto';

export class UpdateEmployeeResignationDto extends PartialType(
  CreateEmployeeResignationDto
) {}
