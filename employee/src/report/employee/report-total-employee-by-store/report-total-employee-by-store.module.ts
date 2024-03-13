import { Module } from '@nestjs/common';
import { CompanyStructureRepository } from '../../../company-structure/repository/company-structure.repository';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { ReportTotalEmployeeByStoreController } from './report-total-employee-by-store.controller';
import { ReportTotalEmployeeByStoreService } from './report-total-employee-by-store.service';

@Module({
  controllers: [ReportTotalEmployeeByStoreController],
  providers: [
    ReportTotalEmployeeByStoreService,
    CompanyStructureRepository,
    EmployeeRepository
  ]
})
export class ReportTotalEmployeeByStoreModule {}
