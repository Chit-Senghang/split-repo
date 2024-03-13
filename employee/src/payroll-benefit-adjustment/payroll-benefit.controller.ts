import {
  Controller,
  Get,
  UseInterceptors,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
  Post,
  Body
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { PAYROLL_BENEFIT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/payroll-benefit.enum';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PayrollBenefitAdjustmentService } from './payroll-benefit-adjustment.service';
import { PaginationPayrollBenefitDto } from './dto/payroll-benefit-pagination.dto';
import { PayrollBenefitAdjustment } from './entities/payroll-benefit-adjustment.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('payroll-benefit')
@Controller('payroll-benefit')
export class PayrollBenefitController {
  constructor(
    private readonly payrollBenefitAdjustmentService: PayrollBenefitAdjustmentService
  ) {}

  @ApiOkResponse({ type: PayrollBenefitAdjustment })
  @UseGuards(PermissionGuard(PAYROLL_BENEFIT_PERMISSION.READ_PAYROLL_BENEFIT))
  @Get()
  findAllBenefits(@Query() pagination: PaginationPayrollBenefitDto) {
    return this.payrollBenefitAdjustmentService.getCurrentPayrollBenefit(
      pagination
    );
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationPayrollBenefitDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.payrollBenefitAdjustmentService.exportPayrollBenefitFile(
      pagination,
      exportFileDto
    );
  }

  @ApiOkResponse({ type: PayrollBenefitAdjustment })
  @UseGuards(PermissionGuard(PAYROLL_BENEFIT_PERMISSION.READ_PAYROLL_BENEFIT))
  @Get('employee/:employeeId/year/:year/history')
  findAllBenefitHistory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('year', ParseIntPipe) year: number
  ) {
    return this.payrollBenefitAdjustmentService.getAllPayrollBenefitHistory(
      employeeId,
      year
    );
  }

  @ApiOkResponse({ type: PayrollBenefitAdjustment })
  @UseGuards(PermissionGuard(PAYROLL_BENEFIT_PERMISSION.READ_PAYROLL_BENEFIT))
  @Get(':payrollBenefitAdjustmentId/for-adjustment')
  findAllBenefitForAdjustment(
    @Query() pagination: PaginationPayrollBenefitDto,
    @Param('payrollBenefitAdjustmentId', ParseIntPipe)
    payrollBenefitAdjustmentId: number
  ) {
    return this.payrollBenefitAdjustmentService.getPayrollBenefitAdjustmentForAdjustment(
      payrollBenefitAdjustmentId,
      pagination
    );
  }
}
