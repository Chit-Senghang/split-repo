import { SALARY_COMPONENT_PERMISSION } from '../ts/enum/permission/employee/salary-component.enum';
import { SALARY_COMPONENT_TYPE_PERMISSION } from '../ts/enum/permission/payroll/salary-component-type.enum';

export const salaryComponentAndSalaryComponentType = {
  name: 'META_DATA_MODULE',
  sub: [
    {
      name: 'SALARY_COMPONENT_TYPE',
      sub: Object.create(SALARY_COMPONENT_TYPE_PERMISSION)
    },
    {
      name: 'SALARY_COMPONENT',
      sub: Object.create(SALARY_COMPONENT_PERMISSION)
    }
  ]
};
