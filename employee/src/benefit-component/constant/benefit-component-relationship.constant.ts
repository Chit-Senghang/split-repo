import { FindOptionsRelations } from 'typeorm';
import { BenefitComponent } from '../entities/benefit-component.entity';

export const BENEFIT_COMPONENT_RELATIONSHIP = {
  benefitComponentType: true
} as FindOptionsRelations<BenefitComponent>;
