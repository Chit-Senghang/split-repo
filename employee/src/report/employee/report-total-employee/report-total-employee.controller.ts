import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { ReportTotalEmployeeResponse } from './dto/report-total-employee-response';
import { ReportTotalEmployeeService } from './report-total-employee.service';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('report')
@Controller('report')
export class ReportTotalEmployeeController {
  constructor(
    private readonly reportTotalEmployeeService: ReportTotalEmployeeService
  ) {}

  @Get('employee/total-employee-report')
  @ApiOkResponse({ type: ReportTotalEmployeeResponse })
  @UseGuards(PermissionGuard('READ_REPORT_TOTAL_EMPLOYEE'))
  reportTotalEmployee() {
    return this.reportTotalEmployeeService.reportTotalEmployee();
  }
}
