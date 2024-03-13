import { Module } from '@nestjs/common';
import { AttendanceReportRepository } from '../../../../../employee/src/attendance/attendance-report/repository/attendance-report.repository';
import { MissedScanRequestRepository } from '../../../../../employee/src/attendance/missed-scan-request/repository/missed-scan-request.repository';
import { AttendanceReminderReportService } from './attendance-reminder-report.service';
import { AttendanceReminderReportController } from './attendance-reminder-report.controller';
import { AttendanceReminderReportRepository } from './repository/attendance-reminder-report.repository';

@Module({
  providers: [
    AttendanceReminderReportService,
    AttendanceReportRepository,
    AttendanceReminderReportRepository,
    MissedScanRequestRepository
  ],
  controllers: [AttendanceReminderReportController]
})
export class AttendanceReminderReportModule {}
