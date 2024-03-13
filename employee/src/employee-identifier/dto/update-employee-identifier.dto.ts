import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeIdentifierDto } from './create-employee-identifier.dto';

export class UpdateEmployeeIdentifierDto extends PartialType(
  CreateEmployeeIdentifierDto
) {}
