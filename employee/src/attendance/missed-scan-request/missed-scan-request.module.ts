import { Module } from '@nestjs/common';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { AttendanceReportService } from '../attendance-report/attendance-report.service';
import { JobSchedulerLogService } from '../../job-scheduler-log/job-scheduler-log-service';
import { MediaModule } from '../../media/media.module';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { DayOffRequestRepository } from '../../leave/day-off-request/repository/day-off-request.repository';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { PublicHolidayRepository } from '../public-holiday/repository/public-holiday.repository';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { MissionRequestRepository } from '../../leave/mission-request/repository/mission-request.repository';
import { JobSchedulerLogRepository } from '../../job-scheduler-log/repository/job-scheduler-log.repository';
import { AttendanceRecordRepository } from '../attendance-record/repository/attendance-record.repository';
import { OvertimeRequestRepository } from '../overtime-request/repository/overtime-request.repository';
import { AttendanceReportRepository } from '../attendance-report/repository/attendance-report.repository';
import { LeaveTypeVariationRepository } from '../../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { LeaveTypeRepository } from '../../leave/leave-request-type/repository/leave-type.repository';
import { MissedScanRequestController } from './missed-scan-request.controller';
import { MissedScanRequestService } from './missed-scan-request.service';
import { MissedScanRequestRepository } from './repository/missed-scan-request.repository';

@Module({
  controllers: [MissedScanRequestController],
  imports: [MediaModule],
  providers: [
    MissedScanRequestService,
    ApprovalStatusTrackingValidationService,
    AttendanceReportService,
    JobSchedulerLogService,
    EmployeeRepository,
    OvertimeRequestRepository,
    AttendanceReportRepository,
    AttendanceRecordRepository,
    DayOffRequestRepository,
    EmployeeWorkingScheduleRepository,
    PublicHolidayRepository,
    LeaveRequestRepository,
    MissionRequestRepository,
    MissedScanRequestRepository,
    JobSchedulerLogRepository,
    LeaveTypeVariationRepository,
    LeaveStockRepository,
    LeaveTypeRepository
  ],
  exports: [MissedScanRequestService]
})
export class MissedScanRequestModule {}
