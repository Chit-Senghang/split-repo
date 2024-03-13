import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { PayrollReport } from '../entities/payroll-report.entity';

export const PAYROLL_REPORT_SELECTED_FIELDS = {
  payrollReportDetail: {
    id: true,
    amount: true,
    type: true,
    typeId: true
  },
  payrollByStore: {
    id: true,
    store: { id: true, companyStructureComponent: { id: true, name: true } }
  },
  employee: {
    id: true,
    displayFullNameEn: true,
    displayFullNameKh: true,
    accountNo: true
  }
} as FindOptionsSelect<PayrollReport>;

export const PAYROLL_REPORT_RELATIONSHIP = {
  payrollReportDetail: true,
  payrollByStore: { store: { companyStructureComponent: true } },
  employee: true
} as FindOptionsRelations<PayrollReport>;
