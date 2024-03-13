import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollBenefitAdjustment } from '../../entities/payroll-benefit-adjustment.entity';

export interface IPayrollBenefitAdjustmentRepository
  extends IRepositoryBase<PayrollBenefitAdjustment> {}
