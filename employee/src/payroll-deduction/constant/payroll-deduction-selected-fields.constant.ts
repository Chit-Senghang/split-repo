import { FindOptionsSelect } from 'typeorm';
import { PayrollDeduction } from '../entities/payroll-deduction.entity';

export const PAYROLL_DEDUCTION_SELECTED_FIELDS = {
  payrollDeductionType: {
    id: true,
    name: true
  },
  employee: {
    id: true,
    displayFullNameEn: true,
    accountNo: true,
    email: true,
    firstNameEn: true,
    lastNameEn: true,
    startDate: true,
    status: true,
    positions: {
      id: true,
      mpath: true,
      isDefaultPosition: true,
      companyStructureLocation: {
        id: true,
        companyStructureComponent: { id: true, name: true }
      },
      companyStructureOutlet: {
        id: true,
        companyStructureComponent: { id: true, name: true }
      },
      companyStructureDepartment: {
        id: true,
        companyStructureComponent: { id: true, name: true }
      },
      companyStructureTeam: {
        id: true,
        companyStructureComponent: { id: true, name: true }
      },
      companyStructurePosition: {
        id: true,
        companyStructureComponent: { id: true, name: true }
      }
    }
  }
} as FindOptionsSelect<PayrollDeduction>;
