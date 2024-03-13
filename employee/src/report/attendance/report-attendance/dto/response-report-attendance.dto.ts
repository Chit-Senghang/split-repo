import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { ReportAttendanceEnum } from '../enum/report-attendance.enum';

export class ResponseReportAttendanceDto {
  id: number;

  createdAt: string | Date;

  updatedAt: string | Date;

  fingerPrintId: string;

  isMissedScan: boolean;

  scanTime: string | Date;

  beforeAdjustment?: string | Date;

  employee: Employee;

  attendanceStatus: ReportAttendanceEnum;
}
