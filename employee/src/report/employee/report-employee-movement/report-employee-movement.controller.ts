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
import { ReportEmployeeMovementService } from './report-employee-movement.service';
import { PaginationReportEmployeeMovementDto } from './dto/pagination-report-employee-movement.dto';
import { ResponseReportEmployeeMovementDto } from './dto/response-report-employee-movement.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('report')
@Controller('report')
export class ReportEmployeeMovementController {
  constructor(
    private readonly reportEmployeeMovementService: ReportEmployeeMovementService
  ) {}

  @Get('employee/employee-movement')
  @UseGuards(PermissionGuard('READ_REPORT_EMPLOYEE_MOVEMENT'))
  @ApiOkResponse({ type: ResponseReportEmployeeMovementDto })
  reportEmployeeMovement(
    @Query() pagination: PaginationReportEmployeeMovementDto
  ) {
    return this.reportEmployeeMovementService.reportEmployeeMovement(
      pagination
    );
  }
}
