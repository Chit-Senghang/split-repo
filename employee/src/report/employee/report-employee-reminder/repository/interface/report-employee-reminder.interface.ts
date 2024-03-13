import { Employee } from '../../../../../../../employee/src/employee/entity/employee.entity';
import { PublicHoliday } from './../../../../../attendance/public-holiday/entities/public-holiday.entity';

export interface IReportEmployeeReminderRepository {
  getEmployeePassPostProbation(date: Date): Promise<Employee[]>;

  getTotalEmployeeBirthdayCount(): Promise<number>;

  getTotalEmployeeWorkAnniversaryCount(): Promise<number>;

  getTotalPublicHolidayCount(date: Date): Promise<PublicHoliday[]>;
}
