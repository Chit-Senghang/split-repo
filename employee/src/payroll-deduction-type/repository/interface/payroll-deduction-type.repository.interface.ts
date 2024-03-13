import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollDeductionType } from '../../entities/payroll-deduction-type.entity';

export interface IPayrollDeductionTypeRepository
  extends IRepositoryBase<PayrollDeductionType> {}
