import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { EmployeeWorkAnniversaryReportPaginationDto } from './dto/employee-work-anniversary-report.pagination.dto';
import { EmployeeWorkAnniversaryReportService } from './employee-work-anniversary-report.service';

@UseInterceptors(ResponseMappingInterceptor)
@Controller('report/employee-work-anniversary-report')
export class EmployeeWorkAnniversaryReportController {
  constructor(
    private readonly employeeWorkAnniversaryReportService: EmployeeWorkAnniversaryReportService
  ) {}

  @UseGuards(PermissionGuard('READ_EMPLOYEE_WORK_ANNIVERSARY_REPORT'))
  @Post('export')
  async export(
    @Query() pagination: EmployeeWorkAnniversaryReportPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.employeeWorkAnniversaryReportService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(PermissionGuard('READ_EMPLOYEE_WORK_ANNIVERSARY_REPORT'))
  @Get()
  async getAllEmployeeWithBirthdayInMonthExport(
    @Query() pagination: EmployeeWorkAnniversaryReportPaginationDto
  ) {
    return this.employeeWorkAnniversaryReportService.getEmployeeWithStartDateInMonth(
      pagination
    );
  }
}
