import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../../guards/permission.guard';
import { LeaveRemainingReportService } from './leave-remaining-report.service';

@Controller('report/leave/leave-remaining-report')
export class LeaveRemainingReportController {
  constructor(
    private readonly leaveRemainingReportService: LeaveRemainingReportService
  ) {}

  @UseGuards(PermissionGuard('READ_LEAVE_REMAINING_REPORT'))
  @Get()
  getEmployeeLeaveRemainingReport() {
    return this.leaveRemainingReportService.getLeaveRemainingReport();
  }
}
