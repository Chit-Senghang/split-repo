import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeContactDto } from './create-employee-contact.dto';

export class UpdateEmployeeContactDto extends PartialType(
  CreateEmployeeContactDto
) {}
