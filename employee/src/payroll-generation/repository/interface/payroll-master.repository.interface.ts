import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollMaster } from '../../entities/payroll-master.entity';

export interface IPayrollMasterRepository
  extends IRepositoryBase<PayrollMaster> {}
