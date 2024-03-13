import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ReportEmployeeReminderService } from './report-employee-reminder.service';
import { PaginationReportEmployeeReminder } from './dto/pagination-report-employee-reminder.dto';
import { ResponseReportEmployeeReminderDto } from './dto/response-report-employee-reminder.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('report')
@Controller('report')
export class ReportEmployeeReminderController {
  constructor(
    private readonly reportEmployeeReminderService: ReportEmployeeReminderService
  ) {}

  @ApiOkResponse({ type: ResponseReportEmployeeReminderDto })
  @Get('employee/employee-reminder')
  @UseGuards(PermissionGuard('READ_REPORT_EMPLOYEE_REMINDER'))
  reportEmployeeReminder(
    @Query() pagination: PaginationReportEmployeeReminder
  ) {
    return this.reportEmployeeReminderService.reportEmployeeReminder(
      pagination
    );
  }
}
