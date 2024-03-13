import { Inject } from '@nestjs/common';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { IEmployeeRepository } from './../../../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from './../../../../employee/repository/employee.repository';
import { IReportTotalEmployeeRepository } from './interface/report-total-employee.interface';

export class ReportTotalEmployeeRepository
  implements IReportTotalEmployeeRepository
{
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async getAllPostProbation(): Promise<Employee[]> {
    return await this.employeeRepo.findAllPostProbation();
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await this.employeeRepo.getAllEmployees();
  }
}
