import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../../../guards/permission.guard';
import { ResponseMappingInterceptor } from '../../../shared-resources/common/interceptor/response-mapping.interceptor';
import { EmployeePostProbationReportService } from './employee-post-probation-report.service';
import { EmployeePostProbationReportPaginationDto } from './dto/employee-post-probation-report-pagination.dto';

@UseInterceptors(ResponseMappingInterceptor)
@Controller('report/employee-post-probation-report')
export class EmployeePostProbationReportController {
  constructor(
    private readonly employeePostProbationReportService: EmployeePostProbationReportService
  ) {}

  @UseGuards(PermissionGuard('READ_EMPLOYEE_POST_PROBATION_REPORT'))
  @Post('export')
  async export(
    @Query() pagination: EmployeePostProbationReportPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return await this.employeePostProbationReportService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(PermissionGuard('READ_EMPLOYEE_POST_PROBATION_REPORT'))
  @Get()
  async getAllEmployeeWithPostProbationInCurrentMonth(
    @Query() pagination: EmployeePostProbationReportPaginationDto
  ) {
    return await this.employeePostProbationReportService.getAllEmployeeWithPostProbationInCurrentMonth(
      pagination
    );
  }
}
