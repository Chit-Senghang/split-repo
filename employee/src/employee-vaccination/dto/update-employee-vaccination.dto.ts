import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeVaccinationDto } from './create-employee-vaccination.dto';

export class UpdateEmployeeVaccinationDto extends PartialType(
  CreateEmployeeVaccinationDto
) {}
