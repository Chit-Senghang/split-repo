import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { getPaginationResponseDto } from '../../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ReportAttendanceService } from './report-attendance.service';
import { PaginationReportAttendanceDto } from './dto/pagination-report-attendance.dto';
import { ResponseReportAttendanceSummary } from './dto/response-report-attendance-summery';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('report')
@Controller('report')
export class ReportAttendanceController {
  constructor(
    private readonly reportAttendanceService: ReportAttendanceService
  ) {}

  @Get('attendance/employee-current-day-attendance/summary')
  @UseGuards(PermissionGuard('READ_REPORT_EMPLOYEE_ATTENDANCE'))
  @ApiOkResponse({ type: ResponseReportAttendanceSummary })
  reportAttendanceSummary(@Query() pagination: PaginationReportAttendanceDto) {
    return this.reportAttendanceService.reportAttendanceSummary(pagination);
  }

  @ApiOkResponse({
    type: getPaginationResponseDto(PaginationReportAttendanceDto)
  })
  @Get('attendance/employee-current-day-attendance')
  @UseGuards(PermissionGuard('READ_REPORT_EMPLOYEE_ATTENDANCE'))
  reportEmployeeCurrentDayAttendance(
    @Query() pagination: PaginationReportAttendanceDto
  ) {
    return this.reportAttendanceService.reportEmployeeCurrentDayAttendance(
      pagination
    );
  }

  @Post('attendance/employee-current-day-attendance/export')
  @UseGuards(PermissionGuard('READ_REPORT_EMPLOYEE_ATTENDANCE'))
  exportAttendanceFile(
    @Query()
    pagination: PaginationReportAttendanceDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.reportAttendanceService.reportEmployeeCurrentDayAttendanceExport(
      pagination,
      exportFileDto
    );
  }
}
