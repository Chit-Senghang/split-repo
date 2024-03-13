import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { DayOffRequestRepository } from '../../leave/day-off-request/repository/day-off-request.repository';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { MissionRequestRepository } from '../../leave/mission-request/repository/mission-request.repository';
import { PublicHolidayRepository } from '../public-holiday/repository/public-holiday.repository';
import { LeaveTypeVariationRepository } from '../../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { AttendanceRecordRepository } from '../attendance-record/repository/attendance-record.repository';
import { OvertimeRequestRepository } from '../overtime-request/repository/overtime-request.repository';
import { LeaveTypeRepository } from '../../leave/leave-request-type/repository/leave-type.repository';
import { AttendanceReportController } from './attendance-report.controller';
import { AttendanceReportService } from './attendance-report.service';
import { AttendanceReportRepository } from './repository/attendance-report.repository';

@Module({
  controllers: [AttendanceReportController],
  providers: [
    AttendanceReportService,
    EmployeeRepository,
    OvertimeRequestRepository,
    AttendanceReportRepository,
    AttendanceRecordRepository,
    DayOffRequestRepository,
    EmployeeWorkingScheduleRepository,
    PublicHolidayRepository,
    LeaveRequestRepository,
    MissionRequestRepository,
    LeaveTypeVariationRepository,
    LeaveStockRepository,
    LeaveTypeRepository
  ],
  imports: [],
  exports: [AttendanceReportService]
})
export class AttendanceReportModule {}
