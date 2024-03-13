import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { SalaryTaxWithheldRank } from '../../entities/salary-tax-withheld-rank.entity';

export interface ISalaryTaxWithheldRank
  extends IRepositoryBase<SalaryTaxWithheldRank> {
  getOneOrFailed(id: number): Promise<SalaryTaxWithheldRank>;
}
