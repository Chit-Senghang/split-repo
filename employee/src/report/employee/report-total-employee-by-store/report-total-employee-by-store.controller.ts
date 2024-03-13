import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ReportTotalEmployeeByStoreService } from './report-total-employee-by-store.service';

@Controller('report/total-employee-by-store')
export class ReportTotalEmployeeByStoreController {
  constructor(
    private readonly reportTotalEmployeeByStoreService: ReportTotalEmployeeByStoreService
  ) {}

  @UseGuards(PermissionGuard('READ_REPORT_TOTAL_EMPLOYEE_BY_LOCATION_STORE'))
  @Get()
  getTotalEmployeeByStore() {
    return this.reportTotalEmployeeByStoreService.getTotalEmployeeByStore();
  }
}
