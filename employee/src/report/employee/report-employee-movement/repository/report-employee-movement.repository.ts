import { Inject } from '@nestjs/common';
import { EmployeeResignationRepository } from '../../../../../../employee/src/employee-resignation/repository/employee-resignation.repository';
import { IEmployeeResignationRepository } from '../../../../../../employee/src/employee-resignation/repository/interface/employee-resignation.repository.interface';
import { EmployeeRepository } from '../../../../../../employee/src/employee/repository/employee.repository';
import { IEmployeeRepository } from '../../../../../../employee/src/employee/repository/interface/employee.repository.interface';
import { EmployeeResignationStatusEnum } from '../../../../../../employee/src/employee-resignation/common/ts/enums/employee-resignation-status.enum';
import { In } from 'typeorm';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { EmployeeResignation } from '../../../../../../employee/src/employee-resignation/entity/employee-resignation.entity';
import { IReportEmployeeMovementRepository } from './interface/report-employee-movement.interface';

export class ReportEmployeeMovementRepository
  implements IReportEmployeeMovementRepository
{
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(EmployeeResignationRepository)
    private readonly employeeResignationRepo: IEmployeeResignationRepository
  ) {}

  async newEmployeeCount(): Promise<number> {
    const employees: Employee[] =
      await this.employeeRepo.findStartDateWithCurrentDate();

    return employees.length || 0;
  }

  async resignEmployeeCount(
    currentDate: Date,
    inputDate?: Date
  ): Promise<number> {
    const employeeResignations: EmployeeResignation[] =
      await this.employeeResignationRepo.findResignDateDateAndStatus({
        resignDate: inputDate ?? currentDate,
        status: In([
          EmployeeResignationStatusEnum.ACTIVE,
          EmployeeResignationStatusEnum.IN_SCHEDULE
        ])
      });
    return employeeResignations.length || 0;
  }
}
