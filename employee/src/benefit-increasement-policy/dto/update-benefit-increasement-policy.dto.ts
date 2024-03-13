import { PartialType } from '@nestjs/swagger';
import { CreateBenefitIncreasementPolicyDto } from './create-benefit-increasement-policy.dto';

export class UpdateBenefitIncreasementPolicyDto extends PartialType(
  CreateBenefitIncreasementPolicyDto
) {}
