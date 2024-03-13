import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PayrollAdjustmentSummaryReportService } from './payroll-adjustment-summary-report.service';

@ApiTags('payroll-adjustment-summary-report')
@ApiBearerAuth()
@Controller('payroll-adjustment-summary-report')
export class PayrollAdjustmentSummaryReportController {
  constructor(
    private readonly payrollAdjustmentSummaryReportService: PayrollAdjustmentSummaryReportService
  ) {}

  @Get('year/:year/month/:month/master-payroll-list')
  getMasterListReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getMasterListReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/master-payroll-list-check')
  getMasterPayrollListCheckReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getMasterPayrollListCheckReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/resign-employee')
  getResignEmployeeReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getResignEmployeeReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/new-employee-added')
  getNewEmployeeAddedReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getNewEmployeeAddedReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/post-probation-employee')
  getPostProbationEmployeeReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getPostProbationEmployeeReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/full-post-probation-employee')
  getFullPostProbationEmployeeReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getFullPostProbationEmployeeReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/salary-increment-employee')
  getSalaryIncrementReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getSalaryIncrementReport(
      year,
      month
    );
  }

  @Get('year/:year/month/:month/change-work-shift-employee')
  getChangeWorkShiftEmployeeReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getChangeWorkShiftEmployeeReport(
      year,
      month
    );
  }

  // attendance allowance added/deducted
  @Get('other/year/:year/month/:month/attendance-allowance')
  getAttendanceAllowanceReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getAttendanceAllowanceReport(
      year,
      month
    );
  }

  // night shift added/deducted
  @Get('other/year/:year/month/:month/night-shift')
  getNightShiftReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getNightShiftReport(
      year,
      month
    );
  }

  // who had take maternity or medical leave or had adjust on position or att allowance from previous month
  @Get(
    'other/year/:year/month/:month/who-had-take-maternity-medical-leave-adjust-position-attendance-from-previous-month'
  )
  getWhoHadTakeReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getWhoHadTakeReport(
      year,
      month
    );
  }

  // new hiring that get full pay compare to last month
  @Get(
    'other/year/:year/month/:month/new-hiring-get-full-pay-compare-last-month'
  )
  getNewHireGetFullPayCompareLastMonthReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getNewHireGetFullPayCompareLastMonthReport(
      year,
      month
    );
  }

  // resigned before end of month (can't get full pay)
  @Get('other/year/:year/month/:month/resigned-before-end-of-month')
  getResignedBeforeEndOfMonthReport(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.payrollAdjustmentSummaryReportService.getResignedBeforeEndOfMonthReport(
      year,
      month
    );
  }
}
