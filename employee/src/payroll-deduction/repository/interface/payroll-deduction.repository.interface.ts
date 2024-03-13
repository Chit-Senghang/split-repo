import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollDeduction } from '../../entities/payroll-deduction.entity';

export interface IPayrollDeductionRepository
  extends IRepositoryBase<PayrollDeduction> {}
