import { PartialType } from '@nestjs/swagger';
import { CreateCompanyStructureDto } from './create-company-structure.dto';

export class UpdateCompanyStructureDto extends PartialType(
  CreateCompanyStructureDto
) {}
