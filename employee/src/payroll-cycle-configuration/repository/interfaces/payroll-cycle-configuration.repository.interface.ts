import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollCycleConfiguration } from '../../entities/payroll-cycle-configuration.entity';

export interface IPayrollCycleConfiguration
  extends IRepositoryBase<PayrollCycleConfiguration> {
  getOneWithNotFound(): Promise<PayrollCycleConfiguration>;
}
