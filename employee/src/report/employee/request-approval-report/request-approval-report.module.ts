import { Module } from '@nestjs/common';
import { ApprovalStatusTrackingModule } from '../../../../../employee/src/approval-status-tracking/approval-status-tracking.module';
import { RequestApprovalReportController } from './request-approval-report.controller';
import { RequestApprovalReportService } from './request-approval-report.service';

@Module({
  controllers: [RequestApprovalReportController],
  providers: [RequestApprovalReportService],
  imports: [ApprovalStatusTrackingModule]
})
export class RequestApprovalReportModule {}
