import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../../../../../employee/src/guards/permission.guard';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { AttendanceReminderReportDto } from './dto/attendance-reminder-report';
import { AttendanceReminderReportService } from './attendance-reminder-report.service';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('report')
@Controller('report')
export class AttendanceReminderReportController {
  constructor(
    private readonly attendanceReminderReportService: AttendanceReminderReportService
  ) {}

  @ApiOkResponse({ type: AttendanceReminderReportDto })
  @UseGuards(PermissionGuard('READ_REPORT_ATTENDANCE_REMINDER'))
  @Get('attendance/attendance-reminder-report')
  getAttendanceReminderReport() {
    return this.attendanceReminderReportService.getAttendanceReminderReport();
  }
}
