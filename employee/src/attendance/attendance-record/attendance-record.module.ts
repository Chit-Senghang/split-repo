import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportService } from '../attendance-report/attendance-report.service';
import { CompanyStructureRepository } from '../../company-structure/repository/company-structure.repository';
import { AttendanceReportRepository } from '../attendance-report/repository/attendance-report.repository';
import { DayOffRequestRepository } from '../../leave/day-off-request/repository/day-off-request.repository';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { OvertimeRequestRepository } from '../overtime-request/repository/overtime-request.repository';
import { PublicHolidayRepository } from '../public-holiday/repository/public-holiday.repository';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { MissionRequestRepository } from '../../leave/mission-request/repository/mission-request.repository';
import { LeaveTypeVariationRepository } from '../../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { AttendanceRecordController } from './attendance-record.controller';
import { AttendanceRecordService } from './attendance-record.service';
import { AttendanceRecordRepository } from './repository/attendance-record.repository';

@Module({
  controllers: [AttendanceRecordController],
  providers: [
    AttendanceRecordService,
    EmployeeRepository,
    AttendanceRecordRepository,
    AttendanceReportService,
    AttendanceReportRepository,
    DayOffRequestRepository,
    EmployeeWorkingScheduleRepository,
    OvertimeRequestRepository,
    PublicHolidayRepository,
    LeaveRequestRepository,
    MissionRequestRepository,
    LeaveTypeVariationRepository,
    LeaveStockRepository,
    CompanyStructureRepository
  ],
  exports: [AttendanceRecordRepository]
})
export class AttendanceRecordModule {}
