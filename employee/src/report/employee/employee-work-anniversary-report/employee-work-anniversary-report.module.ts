import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { EmployeeWorkAnniversaryReportService } from './employee-work-anniversary-report.service';
import { EmployeeWorkAnniversaryReportController } from './employee-work-anniversary-report.controller';
import { EmployeeWorkAnniversaryReportRepository } from './repository/employee-work-anniversary-report.repository';

@Module({
  controllers: [EmployeeWorkAnniversaryReportController],
  providers: [
    EmployeeWorkAnniversaryReportService,
    EmployeeRepository,
    EmployeeWorkAnniversaryReportRepository
  ]
})
export class EmployeeWorkAnniversaryReportModule {}
