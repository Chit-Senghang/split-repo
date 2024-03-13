import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollReport } from '../../entities/payroll-report.entity';

export interface IPayrollReportRepository
  extends IRepositoryBase<PayrollReport> {}
