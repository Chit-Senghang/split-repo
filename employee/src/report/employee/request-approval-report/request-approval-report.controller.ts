import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../../../guards/permission.guard';
import { RequestApprovalReportService } from './request-approval-report.service';
import { ReportApprovalRequestQueryDto } from './dto/report-approval-request.dto';

@Controller('report/request-approval-report')
export class RequestApprovalReportController {
  constructor(
    private readonly requestApprovalService: RequestApprovalReportService
  ) {}

  @UseGuards(PermissionGuard('READ_REPORT_REQUEST_APPROVAL_REPORT'))
  @Get()
  getApprovalRequestReport(@Query() query: ReportApprovalRequestQueryDto) {
    return this.requestApprovalService.getApprovalStatusReport(query);
  }
}
