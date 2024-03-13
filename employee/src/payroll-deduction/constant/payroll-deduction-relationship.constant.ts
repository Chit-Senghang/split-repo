import { FindOptionsRelations } from 'typeorm';
import { PayrollDeduction } from '../entities/payroll-deduction.entity';

export const PAYROLL_DEDUCTION_RELATIONSHIP = {
  payrollDeductionType: true,
  employee: {
    contacts: true,
    positions: {
      companyStructureLocation: { companyStructureComponent: true },
      companyStructureOutlet: { companyStructureComponent: true },
      companyStructureDepartment: { companyStructureComponent: true },
      companyStructureTeam: { companyStructureComponent: true },
      companyStructurePosition: { companyStructureComponent: true }
    }
  }
} as FindOptionsRelations<PayrollDeduction>;
