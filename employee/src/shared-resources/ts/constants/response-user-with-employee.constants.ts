import { EmployeeDto } from '../../proto/employee/employee.pb';

export function templateUserWithEmployee(approval: any, template: EmployeeDto) {
  const data = {
    id: approval.id,
    name: approval.username,
    employee: {
      id: template.id,
      displayName: template.displayFullNameEn
    }
  };
  return { ...data };
}
