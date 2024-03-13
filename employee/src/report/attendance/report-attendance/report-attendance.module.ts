import { Module } from '@nestjs/common';
import { AttendanceRecordRepository } from '../../../../../employee/src/attendance/attendance-record/repository/attendance-record.repository';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { ReportAttendanceController } from './report-attendance.controller';
import { ReportAttendanceService } from './report-attendance.service';
import { ReportAttendanceRepository } from './repository/report-attendance.repository';

@Module({
  controllers: [ReportAttendanceController],
  providers: [
    ReportAttendanceService,
    EmployeeRepository,
    AttendanceRecordRepository,
    ReportAttendanceRepository
  ]
})
export class ReportAttendanceModule {}
