import { Inject } from '@nestjs/common';
import { IPublicHolidayRepository } from '../../../../../../employee/src/attendance/public-holiday/repository/interface/public-holiday.repository.interface';
import { PublicHolidayRepository } from '../../../../../../employee/src/attendance/public-holiday/repository/public-holiday.repository';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { IEmployeeRepository } from '../../../../../../employee/src/employee/repository/interface/employee.repository.interface';
import { PublicHoliday } from './../../../../attendance/public-holiday/entities/public-holiday.entity';
import { EmployeeRepository } from './../../../../employee/repository/employee.repository';
import { IReportEmployeeReminderRepository } from './interface/report-employee-reminder.interface';

export class ReportEmployeeReminderRepository
  implements IReportEmployeeReminderRepository
{
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository
  ) {}

  async getEmployeePassPostProbation(date: Date): Promise<Employee[]> {
    return await this.employeeRepo.findAllPostProbation(date);
  }

  async getTotalEmployeeBirthdayCount(): Promise<number> {
    return await this.employeeRepo.totalEmployeeBirthdayCount();
  }

  async getTotalEmployeeWorkAnniversaryCount(): Promise<number> {
    return await this.employeeRepo.totalEmployeeWorkAnniversaryCount();
  }

  async getTotalPublicHolidayCount(date: Date): Promise<PublicHoliday[]> {
    return await this.publicHolidayRepo.totalPublicHolidayCount(date);
  }
}
