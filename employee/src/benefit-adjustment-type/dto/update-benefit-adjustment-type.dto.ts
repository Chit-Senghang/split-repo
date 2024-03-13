import { PartialType } from '@nestjs/swagger';
import { CreateBenefitAdjustmentTypeDto } from './create-benefit-adjustment-type.dto';

export class UpdateBenefitAdjustmentTypeDto extends PartialType(
  CreateBenefitAdjustmentTypeDto
) {}
