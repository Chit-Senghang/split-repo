import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { BenefitIncreasementPolicy } from '../../entities/benefit-increasement-policy.entity';

export interface IBenefitIncreasementPolicyRepository
  extends IRepositoryBase<BenefitIncreasementPolicy> {}
