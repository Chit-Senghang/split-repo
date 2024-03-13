import { Module } from '@nestjs/common';
import { MissedScanRequestModule } from '../../attendance/missed-scan-request/missed-scan-request.module';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ValidationLeaveService } from '../common/validators/validation-leave.service';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportModule } from '../../attendance/attendance-report/attendance-report.module';
import { MediaModule } from '../../media/media.module';
import { DayOffRequestService } from './day-off-request.service';
import { DayOffRequestController } from './day-off-request.controller';
import { DayOffRequestRepository } from './repository/day-off-request.repository';

@Module({
  controllers: [DayOffRequestController],
  providers: [
    DayOffRequestService,
    ApprovalStatusTrackingValidationService,
    ValidationLeaveService,
    EmployeeRepository,
    DayOffRequestRepository
  ],
  imports: [MissedScanRequestModule, AttendanceReportModule, MediaModule],
  exports: [DayOffRequestService]
})
export class DayOffRequestModule {}
