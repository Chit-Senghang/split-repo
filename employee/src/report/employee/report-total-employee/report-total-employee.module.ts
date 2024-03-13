import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { ReportTotalEmployeeService } from './report-total-employee.service';
import { ReportTotalEmployeeController } from './report-total-employee.controller';
import { ReportTotalEmployeeRepository } from './repository/report-total-employee.repository';

@Module({
  controllers: [ReportTotalEmployeeController],
  providers: [
    ReportTotalEmployeeService,
    EmployeeRepository,
    ReportTotalEmployeeRepository
  ]
})
export class ReportTotalEmployeeModule {}
