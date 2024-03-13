import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../../../employee/src/employee/repository/employee.repository';
import { EmployeeBirthdayReportService } from './employee-birthday-report.service';
import { EmployeeBirthdayReportController } from './employee-birthday-report.controller';
import { EmployeeBirthdayReportRepository } from './repository/employee-birthday-report.repository';

@Module({
  controllers: [EmployeeBirthdayReportController],
  providers: [
    EmployeeBirthdayReportService,
    EmployeeBirthdayReportRepository,
    EmployeeRepository
  ]
})
export class EmployeeBirthdayReportModule {}
