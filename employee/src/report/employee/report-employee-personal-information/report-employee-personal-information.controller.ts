import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ReportEmployeePersonalInformationService } from './report-employee-personal-information.service';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('report')
@Controller('report')
export class ReportEmployeePersonalInformationController {
  constructor(
    private readonly reportEmployeePersonalInformationService: ReportEmployeePersonalInformationService
  ) {}

  @Get('employee/employee-personal-info')
  @UseGuards(PermissionGuard('READ_REPORT_EMPLOYEE_PERSONAL_INFORMATION'))
  @ApiOkResponse({ type: Employee })
  reportEmployeePersonalInformation() {
    return this.reportEmployeePersonalInformationService.reportEmployeePersonalInformation();
  }
}
