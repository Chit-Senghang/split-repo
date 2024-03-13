import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { PayrollBenefitAdjustment } from '../entities/payroll-benefit-adjustment.entity';

export const PAYROLL_BENEFIT_SELECTED_FIELDS = {
  id: true,
  status: true,
  employee: {
    id: true,
    displayFullNameEn: true,
    accountNo: true,
    attendanceAllowanceInProbation: true,
    workingShiftId: {
      id: true,
      workshiftType: {
        id: true,
        name: true
      }
    },
    positions: {
      id: true,
      isDefaultPosition: true,
      companyStructureLocation: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true
        }
      },
      companyStructureOutlet: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true
        }
      },
      companyStructureDepartment: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true
        }
      },
      companyStructureTeam: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true
        }
      },
      companyStructurePosition: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true
        }
      }
    }
  },
  payrollBenefitAdjustmentDetail: {
    id: true,
    adjustAmount: true,
    effectiveDateFrom: true,
    effectiveDateTo: true,
    isPostProbation: true,
    benefitComponent: {
      id: true,
      name: true
    }
  }
} as FindOptionsSelect<PayrollBenefitAdjustment>;

export const PAYROLL_BENEFIT_RELATIONSHIP = {
  employee: {
    workingShiftId: { workshiftType: { workingShift: true } },
    positions: {
      companyStructureLocation: { companyStructureComponent: true },
      companyStructureOutlet: { companyStructureComponent: true },
      companyStructureDepartment: { companyStructureComponent: true },
      companyStructureTeam: { companyStructureComponent: true },
      companyStructurePosition: { companyStructureComponent: true }
    }
  },
  payrollBenefitAdjustmentDetail: { benefitComponent: true }
} as FindOptionsRelations<PayrollBenefitAdjustment>;
