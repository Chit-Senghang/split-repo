import { FindOptionsSelect } from 'typeorm';
import { BenefitComponent } from '../entities/benefit-component.entity';

export const BENEFIT_COMPONENT_SELECTED_FIELDS = {
  benefitComponentType: {
    id: true,
    name: true,
    taxPercentage: true
  }
} as FindOptionsSelect<BenefitComponent>;
