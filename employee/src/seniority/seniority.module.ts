import { Module } from '@nestjs/common';
import { PayrollReportRepository } from '../payroll-generation/repository/payroll-report.repository';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { SeniorityService } from './seniority.service';
import { SeniorityController } from './seniority.controller';
import { SeniorityRepository } from './repository/seniority.repository';

@Module({
  imports: [],
  controllers: [SeniorityController],
  providers: [
    SeniorityService,
    SeniorityRepository,
    PayrollReportRepository,
    EmployeeRepository
  ]
})
export class SeniorityModule {}
