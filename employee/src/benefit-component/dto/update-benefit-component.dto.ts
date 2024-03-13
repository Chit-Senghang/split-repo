import { PartialType } from '@nestjs/swagger';
import { CreateBenefitComponentDto } from './create-benefit-component.dto';

export class UpdateBenefitComponentDto extends PartialType(
  CreateBenefitComponentDto
) {}
