import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../../../employee/src/employee/repository/employee.repository';
import { ReportEmployeePersonalInformationService } from './report-employee-personal-information.service';
import { ReportEmployeePersonalInformationController } from './report-employee-personal-information.controller';

@Module({
  controllers: [ReportEmployeePersonalInformationController],
  providers: [ReportEmployeePersonalInformationService, EmployeeRepository]
})
export class ReportEmployeePersonalInformationModule {}
