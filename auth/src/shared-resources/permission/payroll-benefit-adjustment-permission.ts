import { PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION } from '../ts/enum/permission/employee/payroll-benefit-adjustment.enum';

export const payrollBenefitAdjustment = {
  name: 'PAYROLL_MODULE',
  sub: {
    name: 'PAYROLL_BENEFIT_ADJUSTMENT',
    sub: Object.create(PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION) as []
  }
};
