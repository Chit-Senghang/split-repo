import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../../../employee/src/employee/repository/employee.repository';
import { PublicHolidayRepository } from '../../../../../employee/src/attendance/public-holiday/repository/public-holiday.repository';
import { ReportEmployeeReminderService } from './report-employee-reminder.service';
import { ReportEmployeeReminderController } from './report-employee-reminder.controller';
import { ReportEmployeeReminderRepository } from './repository/report-employee-reminder.repository';

@Module({
  controllers: [ReportEmployeeReminderController],
  providers: [
    ReportEmployeeReminderService,
    EmployeeRepository,
    PublicHolidayRepository,
    ReportEmployeeReminderRepository
  ]
})
export class ReportEmployeeReminderModule {}
