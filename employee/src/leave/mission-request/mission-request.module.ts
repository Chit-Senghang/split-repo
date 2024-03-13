import { Module } from '@nestjs/common';
import { MediaModule } from '../../media/media.module';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ValidationLeaveService } from '../common/validators/validation-leave.service';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportModule } from '../../attendance/attendance-report/attendance-report.module';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { DayOffRequestRepository } from '../day-off-request/repository/day-off-request.repository';
import { MissionRequestService } from './mission-request.service';
import { MissionRequestController } from './mission-request.controller';
import { MissionRequestValidationService } from './mission-request-validation.service';
import { MissionRequestRepository } from './repository/mission-request.repository';

@Module({
  controllers: [MissionRequestController],
  providers: [
    MissionRequestService,
    ApprovalStatusTrackingValidationService,
    ValidationLeaveService,
    MissionRequestValidationService,
    EmployeeRepository,
    DayOffRequestRepository,
    MissionRequestRepository,
    EmployeeWorkingScheduleRepository
  ],
  imports: [MediaModule, AttendanceReportModule],
  exports: [MissionRequestService]
})
export class MissionRequestModule {}
