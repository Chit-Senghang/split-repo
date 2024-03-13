import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PayrollReportDetail } from '../../entities/payroll-report-detail.entity';

export interface IPayrollReportDetailRepository
  extends IRepositoryBase<PayrollReportDetail> {}
