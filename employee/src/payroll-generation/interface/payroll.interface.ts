import { Employee } from '../../employee/entity/employee.entity';
import { PayrollDetail } from './payroll-detail.interface';

export interface Payroll {
  employeeId: number;
  benefit: number;
  deduction: number;
  basicSalary: number;
  overtime: number;
  basicSalary2: number;
  proratePerDay: number;
  seniority: number;
  totalMonthly: number;
  totalMonthlyRound: number;
  pensionFund: number;
  totalExcludePensionFund: number;
  nonTaxSeniority: number;
  netTotal: number;
  workingDay: number;
  salaryTaxWithHeld: number;
  employee: Employee;
  spouse: number;
  children: number;
  attendanceAllowance: number;
  attendanceAllowanceByConfig: number;
  forDependent: number;
  taxPercent: number;
  detail?: PayrollDetail[];
}
