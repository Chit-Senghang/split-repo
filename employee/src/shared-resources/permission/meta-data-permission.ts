import { SALARY_COMPONENT_TYPE_PERMISSION } from '../ts/enum/permission/payroll/salary-component-type.enum';
import { SALARY_COMPONENT_PERMISSION } from '../ts/enum/permission/employee/salary-component.enum';
import { PAYROLL_REPORT_PERMISSION } from '../ts/enum/permission/employee/payroll-report.enum';
import { PAYROLL_DEDUCTION_TYPE_PERMISSION } from '../ts/enum/permission/employee/payroll-deduction-type.enum';

const payrollManagements = {
  name: 'META_DATA_MODULE',
  sub: {
    name: 'PAYROLL_MANAGEMENT',
    sub: [
      {
        name: 'SALARY_COMPONENT_TYPE',
        sub: Object.create(SALARY_COMPONENT_TYPE_PERMISSION)
      },
      {
        name: 'SALARY_COMPONENT',
        sub: Object.create(SALARY_COMPONENT_PERMISSION)
      },
      {
        name: 'PAYROLL_DEDUCTION_TYPE',
        sub: Object.create(PAYROLL_DEDUCTION_TYPE_PERMISSION)
      }
    ]
  }
};

const payrollReports = {
  name: 'PAYROLL_MODULE',
  sub: {
    name: 'PAYROLL_REPORT',
    sub: Object.create(PAYROLL_REPORT_PERMISSION)
  }
};

export { payrollReports, payrollManagements };
