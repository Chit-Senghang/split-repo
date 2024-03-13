import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { EmployeePostProbationReportService } from './employee-post-probation-report.service';
import { EmployeePostProbationReportController } from './employee-post-probation-report.controller';
import { EmployeePostProbationReportRepository } from './repository/employee-post-probation-report.repository';

@Module({
  controllers: [EmployeePostProbationReportController],
  providers: [
    EmployeePostProbationReportService,
    EmployeeRepository,
    EmployeePostProbationReportRepository
  ]
})
export class EmployeePostProbationReportModule {}
