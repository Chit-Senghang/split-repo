import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
  ParseIntPipe,
  Body
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PAYROLL_REPORT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/payroll-report.enum';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { PayrollGenerationService } from './payroll-generation.service';
import { PayrollReportPaginate } from './dto/payroll-report.paginate.dto';
import { ForAccountPagination } from './dto/for-account-paginate.dto';
import { PaymentMethodPaginationDto } from './dto/payment-method-pagination.dto';
import { PayrollByStorePagination } from './dto/payroll-by-store-pagination.dto';
import { SummaryForAccountPagination } from './dto/summary-for-account-pagination.dto';
import { PayrollTaxPagination } from './dto/tax-report-paginate.dto';
import { SummaryPrintForAccount } from './summary-print-for-account.service';
import { PayrollGenerationPaginationDto } from './dto/payroll-generation-pagination.dto';
import { PayrollReportForEssUserPagination } from './dto/payroll-report-for-ess.dto';
import { PayrollReport } from './entities/payroll-report.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('payroll-generation')
@Controller('payroll-generation')
export class PayrollGenerationController {
  constructor(
    private readonly payrollGenerationService: PayrollGenerationService,
    private readonly summaryPrintForAccountService: SummaryPrintForAccount
  ) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.CREATE_PAYROLL_REPORT))
  @Post()
  create(@Query('date') date: string) {
    return this.payrollGenerationService.create(date);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: getPaginationResponseDto(PayrollReport) })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get()
  findAll(@Query() paginate: PayrollReportPaginate) {
    return this.payrollGenerationService.findAll(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: getPaginationResponseDto(PayrollReport) })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/monthly')
  getPayrollMonthly(@Query() pagination: PayrollGenerationPaginationDto) {
    return this.payrollGenerationService.getTotalMonthly(pagination);
  }

  @Post('report/monthly/export')
  exportPayrollMonthlyFile(
    @Query()
    pagination: PayrollGenerationPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.payrollGenerationService.exportPayrollMonthlyFile(
      pagination,
      exportFileDto
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: getPaginationResponseDto(PayrollReport) })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/by-store/:id')
  getPayrollByStore(
    @Param('id') id: number,
    @Query() pagination: PayrollByStorePagination
  ) {
    return this.payrollGenerationService.getPayrollByStore(id, pagination);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollGenerationService.findOne(+id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/self')
  getSelfReport(@Query('date') date: string) {
    return this.payrollGenerationService.getSelfPayroll(date);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/to-bank/excel')
  getToBankExcel(@Query() paginate: PaymentMethodPaginationDto) {
    return this.payrollGenerationService.toBankExcel(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/to-bank')
  getToBank(@Query() pagination: PaymentMethodPaginationDto) {
    return this.payrollGenerationService.toBank(pagination);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/for-account/excel')
  getForAccountExcel(@Query() paginate: ForAccountPagination) {
    return this.payrollGenerationService.forAccount(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/for-account')
  getForAccount(@Query() paginate: ForAccountPagination) {
    return this.payrollGenerationService.getForAccount(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/for-account/summary/:outletIds')
  getForAccountSummaryInOutlets(
    @Param('outletIds') outletIds: number[],
    @Query() pagination: SummaryForAccountPagination
  ) {
    return this.payrollGenerationService.getSummaryForAccount(
      outletIds,
      pagination
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/for-account/total')
  getGrandTotalForAccount(@Query() paginate: ForAccountPagination) {
    return this.payrollGenerationService.grandTotalForAccount(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/for-account/total-by-payment-method')
  getTotalByPaymentMethod(@Query() paginate: ForAccountPagination) {
    return this.payrollGenerationService.totalByBank(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('year/:year/month/:month/report/tax')
  getTotalTax(
    @Query() paginate: PayrollTaxPagination,
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    const yearOfMonth = `${year}-${month}`; // YYYY-MM
    return this.payrollGenerationService.taxReport(paginate, yearOfMonth);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/summaryGrossAndNetSalary')
  getTotalGrossAndNetSalary(@Query() paginate: ForAccountPagination) {
    return this.payrollGenerationService.summaryGrossSalaryAndNetSalary(
      paginate
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/month/:month/year/:year/salary-expense-summary')
  getSalaryExpenseSummary(
    @Param('month', ParseIntPipe) month: number,
    @Param('year', ParseIntPipe) year: number
  ) {
    return this.payrollGenerationService.getSalaryExpenseSummary(month, year);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/summaryForAccount/excel')
  getSummaryForAccountExcel(@Query() paginate: ForAccountPagination) {
    return this.summaryPrintForAccountService.summaryPrintForAccount(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: PayrollReport })
  @UseGuards(PermissionGuard(PAYROLL_REPORT_PERMISSION.READ_PAYROLL_REPORT))
  @Get('report/payroll-master-list-for-ess-user')
  getEmployeePayrollReport(
    @Query() paginate: PayrollReportForEssUserPagination
  ) {
    return this.payrollGenerationService.getPayrollReportForEssUser(paginate);
  }
}
