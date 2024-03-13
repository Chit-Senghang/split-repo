import { Module } from '@nestjs/common';
import { MediaModule } from '../../media/media.module';
import { AttendanceReportModule } from '../../attendance/attendance-report/attendance-report.module';
import { MediaRepository } from '../../media/repository/media.repository';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ValidationLeaveService } from '../common/validators/validation-leave.service';
import { LeaveRequestTypeModule } from '../leave-request-type/leave-request-type.module';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { LeaveTypeRepository } from '../leave-request-type/repository/leave-type.repository';
import { LeaveTypeVariationRepository } from '../leave-request-type/repository/leave-type-variation.repository';
import { DayOffRequestRepository } from '../day-off-request/repository/day-off-request.repository';
import { PublicHolidayRepository } from '../../attendance/public-holiday/repository/public-holiday.repository';
import { ApprovalStatusRepository } from '../../approval-status-tracking/repository/approval-status.repository';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestRepository } from './repository/leave-request.repository';
import { LeaveRequestValidationService } from './leave-request.validation.service';
import { LeaveStockRepository } from './repository/leave-stock.repository';
import { LeaveStockDetailRepository } from './repository/leave-stock-detail.repository';

@Module({
  controllers: [LeaveRequestController],
  providers: [
    LeaveRequestService,
    LeaveRequestRepository,
    MediaRepository,
    ApprovalStatusTrackingValidationService,
    ValidationLeaveService,
    LeaveRequestValidationService,
    EmployeeRepository,
    LeaveTypeRepository,
    LeaveStockRepository,
    LeaveTypeVariationRepository,
    DayOffRequestRepository,
    PublicHolidayRepository,
    ApprovalStatusRepository,
    LeaveStockDetailRepository,
    LeaveTypeVariationRepository
  ],
  imports: [LeaveRequestTypeModule, MediaModule, AttendanceReportModule],
  exports: [LeaveRequestService]
})
export class LeaveRequestModule {}
