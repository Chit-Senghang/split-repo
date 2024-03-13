import { Inject, Injectable } from '@nestjs/common';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import {
  EmployeeStatusEnum,
  EmploymentTypeEnum
} from '../../../employee/enum/employee-status.enum';
import { ReportEnum } from '../../enums/report.enum';
import { ReportTotalEmployeeResponse } from './dto/report-total-employee-response';
import { ReportTotalEmployeeRepository } from './repository/report-total-employee.repository';
import { IReportTotalEmployeeRepository } from './repository/interface/report-total-employee.interface';

@Injectable()
export class ReportTotalEmployeeService {
  constructor(
    @Inject(ReportTotalEmployeeRepository)
    private readonly reportTotalEmployeeRepository: IReportTotalEmployeeRepository
  ) {}

  async reportTotalEmployee(): Promise<ReportTotalEmployeeResponse> {
    let totalEmployeeFullTimeCount: number,
      totalEmployeePartTimeCount: number,
      totalEmployeeFemaleCount: number,
      totalEmployeeMaleCount: number,
      totalEmployeeInProbationCount: number;
    const employeePostProbations: Employee[] =
      await this.reportTotalEmployeeRepository.getAllPostProbation();
    const employees: Employee[] =
      await this.reportTotalEmployeeRepository.getAllEmployees();
    if (employees.length) {
      totalEmployeeFullTimeCount = employees.filter(
        (employee: Employee) =>
          employee.employmentType === EmploymentTypeEnum.FULL_TIME
      ).length;
      totalEmployeePartTimeCount = employees.filter(
        (employee: Employee) =>
          employee.employmentType === EmploymentTypeEnum.PART_TIME
      ).length;
      totalEmployeeFemaleCount = employees.filter(
        (employee: Employee) => employee.gender.value === 'Female'
      ).length;
      totalEmployeeMaleCount = employees.filter(
        (employee: Employee) => employee.gender.value === 'Male'
      ).length;
    }
    if (employeePostProbations.length) {
      totalEmployeeInProbationCount = employeePostProbations.filter(
        (employee: Employee) =>
          employee.status === EmployeeStatusEnum.IN_PROBATION
      ).length;
    }
    return {
      reportId: ReportEnum.REPORT_TOTAL_EMPLOYEE,
      totalEmployeeCount: employees.length,
      totalEmployeeInProbationCount,
      totalEmployeePostProbationCount: employeePostProbations?.length,
      totalEmployeePartTimeCount,
      totalEmployeeFullTimeCount,
      totalEmployeeFemaleCount,
      totalEmployeeMaleCount
    };
  }
}
