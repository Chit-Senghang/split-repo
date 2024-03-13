import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { BenefitIncreasementPolicy } from '../entities/benefit-increasement-policy.entity';

export const BENEFIT_INCREASEMENT_POLICY_RELATIONSHIP = {
  benefitIncreasementPolicyDetail: {
    benefitComponent: { benefitComponentType: true }
  }
} as FindOptionsRelations<BenefitIncreasementPolicy>;

export const BENEFIT_INCREASEMENT_POLICY_SELECTED_FIELDS = {
  id: true,
  name: true,
  benefitIncreasementPolicyDetail: {
    id: true,
    description: true,
    increasementAmount: true,
    benefitComponent: {
      id: true,
      name: true,
      benefitComponentType: { id: true, name: true }
    }
  }
} as FindOptionsSelect<BenefitIncreasementPolicy>;
