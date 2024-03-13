import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeLanguageDto } from './create-employee-language.dto';

export class UpdateEmployeeLanguageDto extends PartialType(
  CreateEmployeeLanguageDto
) {}
