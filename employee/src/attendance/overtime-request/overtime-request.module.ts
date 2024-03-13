import { Module } from '@nestjs/common';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { MediaModule } from '../../media/media.module';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportModule } from '../attendance-report/attendance-report.module';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { AttendanceReportRepository } from '../attendance-report/repository/attendance-report.repository';
import { DayOffRequestRepository } from '../../leave/day-off-request/repository/day-off-request.repository';
import { PublicHolidayRepository } from '../public-holiday/repository/public-holiday.repository';
import { AttendanceRecordRepository } from '../attendance-record/repository/attendance-record.repository';
import { LeaveTypeVariationRepository } from '../../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { OvertimeRequestController } from './overtime-request.controller';
import { OvertimeRequestService } from './overtime-request.service';
import { OvertimeRequestRepository } from './repository/overtime-request.repository';

@Module({
  controllers: [OvertimeRequestController],
  providers: [
    OvertimeRequestService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    OvertimeRequestRepository,
    EmployeeWorkingScheduleRepository,
    LeaveRequestRepository,
    AttendanceReportRepository,
    DayOffRequestRepository,
    PublicHolidayRepository,
    AttendanceRecordRepository,
    LeaveTypeVariationRepository,
    LeaveStockRepository
  ],
  imports: [MediaModule, AttendanceReportModule],
  exports: [OvertimeRequestService]
})
export class OvertimeRequestModule {}
