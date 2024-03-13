import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../../../guards/permission.guard';
import { EmployeeBirthdayReportService } from './employee-birthday-report.service';
import { EmployeeBirthdayReportPaginationDto } from './dto/employee-birthday-report-pagination.dto';

@UseInterceptors(ResponseMappingInterceptor)
@Controller('report/employee-birthday-report')
export class EmployeeBirthdayReportController {
  constructor(
    private readonly employeeBirthdayReportService: EmployeeBirthdayReportService
  ) {}

  @UseGuards(PermissionGuard('READ_EMPLOYEE_BIRTHDAY_REPORT'))
  @Post('export')
  async export(
    @Query() pagination: EmployeeBirthdayReportPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.employeeBirthdayReportService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(PermissionGuard('READ_EMPLOYEE_BIRTHDAY_REPORT'))
  @Get()
  async getAllEmployeeWithBirthdayInMonthExport(
    @Query() pagination: EmployeeBirthdayReportPaginationDto
  ) {
    return this.employeeBirthdayReportService.getEmployeeWithBirthdayInMonth(
      pagination
    );
  }
}
