import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { ReportAttendanceEnum } from '../enum/report-attendance.enum';

export type EmployeeWithAttendanceStatus = Omit<
  Employee & { attendanceStatus: ReportAttendanceEnum },
  'trimColumns'
>;
