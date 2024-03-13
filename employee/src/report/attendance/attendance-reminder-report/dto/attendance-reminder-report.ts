import { ReportEnum } from '../../../enums/report.enum';

export class AttendanceReminderReportDto {
  constructor(
    public reportId: ReportEnum,
    public totalMissedScanCount: number,
    public totalAbsentCount: number,
    public totalLateInMinuteCount: number
  ) {}
}
