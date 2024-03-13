import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { PaymentMethod } from '../../payment-method/entities/payment-method.entity';

export const EMPLOYEE_PAYMENT_METHOD_SELECTED_FIELDS = {
  id: true,
  iBankingReportFormat: true,
  name: true,
  employeePaymentMethodAccount: {
    id: true,
    accountNumber: true,
    employee: {
      id: true,
      accountNo: true,
      displayFullNameEn: true,
      displayFullNameKh: true,
      gender: { id: true, value: true },
      positions: {
        companyStructurePosition: {
          id: true,
          companyStructureComponent: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      payrollReport: {
        id: true,
        totalMonthly: true,
        pensionFund: true,
        totalTax: true,
        netTotal: true
      }
    }
  }
} as FindOptionsSelect<PaymentMethod>;

export const EMPLOYEE_PAYMENT_METHOD_RELATIONSHIP = {
  employeePaymentMethodAccount: {
    employee: {
      gender: true,
      payrollReport: true,
      positions: {
        companyStructurePosition: { companyStructureComponent: true },
        companyStructureDepartment: { companyStructureComponent: true }
      }
    }
  }
} as FindOptionsRelations<PaymentMethod>;
