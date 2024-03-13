import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ATTENDANCE_REPORT_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/attendance-report.enum';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../../guards/permission.guard';
import { PaginationQueryAttendanceReportDto } from './dto/paginate.dto';
import { AttendanceReportService } from './attendance-report.service';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('attendance-report')
@Controller('attendance-report')
export class AttendanceReportController {
  constructor(
    private readonly attendanceReportService: AttendanceReportService
  ) {}

  @UseInterceptors(ResponseMappingInterceptor)
  @Get()
  @UseGuards(
    PermissionGuard(ATTENDANCE_REPORT_PERMISSION.READ_ATTENDANCE_REPORT)
  )
  async getAll(@Query() paginate: PaginationQueryAttendanceReportDto) {
    return this.attendanceReportService.findAll(paginate);
  }

  @Post('export')
  exportAttendanceFile(
    @Query()
    pagination: PaginationQueryAttendanceReportDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.attendanceReportService.exportAttendanceFile(
      pagination,
      exportFileDto
    );
  }

  @Post()
  @UseGuards(
    PermissionGuard(ATTENDANCE_REPORT_PERMISSION.CREATE_ATTENDANCE_REPORT)
  )
  async createReport(@Query('date') date: string) {
    return this.attendanceReportService.generateAttendanceReportByDate(date);
  }

  @Post('monthly')
  @UseGuards(
    PermissionGuard(ATTENDANCE_REPORT_PERMISSION.CREATE_ATTENDANCE_REPORT)
  )
  async createReportByPerMonth(@Query('date') date: string) {
    return this.attendanceReportService.createMonthlyReport(date);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @Get('temporary-report')
  @UseGuards(
    PermissionGuard(ATTENDANCE_REPORT_PERMISSION.READ_ATTENDANCE_REPORT)
  )
  async temporaryReport(@Query() paginate: PaginationQueryAttendanceReportDto) {
    return this.attendanceReportService.temporaryReport(paginate);
  }
}
