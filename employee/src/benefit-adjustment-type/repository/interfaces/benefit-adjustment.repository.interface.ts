import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { BenefitAdjustmentType } from '../../entities/benefit-adjustment-type.entity';

export interface IBenefitAdjustmentType
  extends IRepositoryBase<BenefitAdjustmentType> {
  getOneOrFailed(id: number): Promise<BenefitAdjustmentType>;
}
