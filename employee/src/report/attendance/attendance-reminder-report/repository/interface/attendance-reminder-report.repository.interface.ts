import { FindOperator } from 'typeorm';
import { AttendanceReport } from '../../../../../../../employee/src/attendance/attendance-report/entities/attendance-report.entity';

export interface IAttendanceReminderReportRepository {
  getMissedScanRequestCount(
    currentUserId: number,
    checkBaseCurrentMonthCondition: FindOperator<Date>
  ): Promise<number>;

  getAttendanceReportCount(
    currentUserId: number,
    checkBaseCurrentMonthCondition: FindOperator<Date>
  ): Promise<number>;

  getAttendanceReport(
    currentUserId: number,
    checkBaseCurrentMonthCondition: FindOperator<Date>
  ): Promise<AttendanceReport[]>;
}
