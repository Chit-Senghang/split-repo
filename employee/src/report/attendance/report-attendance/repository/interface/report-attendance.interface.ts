import { PaginationReportAttendanceDto } from '../../dto/pagination-report-attendance.dto';
import { EmployeeWithAttendanceStatus } from '../../type/report-attendance.type';
import { PaginationResponse } from './../../../../../shared-resources/ts/interface/response.interface';
import { AttendanceRecord } from './../../../../../attendance/attendance-record/entities/attendance-record.entity';
import { Employee } from './../../../../../employee/entity/employee.entity';

export interface IReportAttendanceRepository {
  getAllEmployees(
    pagination?: PaginationReportAttendanceDto
  ): Promise<Employee[]>;

  getAttendanceRecordsByScanTime(
    pagination: PaginationReportAttendanceDto
  ): Promise<AttendanceRecord[]>;

  getTotalCountAttendanceRecords(
    scanTime: Date | string,
    allFingerPrintIds: string[]
  ): Promise<number>;

  getReportEmployeeAttendanceWithPagination(
    pagination: PaginationReportAttendanceDto,
    allAbsentAndPresents: EmployeeWithAttendanceStatus[]
  ): Promise<PaginationResponse<Employee>>;
}
