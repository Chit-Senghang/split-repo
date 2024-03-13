import { Inject, Injectable } from '@nestjs/common';
import { AttendanceRecord } from '../../../../../employee/src/attendance/attendance-record/entities/attendance-record.entity';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { checkIsValidYearFormat } from '../../../shared-resources/utils/validate-date-format';
import { DEFAULT_DATE_FORMAT } from '../../../shared-resources/common/dto/default-date-format';
import { getCurrentDateWithFormat } from '../../../shared-resources/common/utils/date-utils';
import { ExportFileDto } from '../../../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../../../shared-resources/export-file/common/enum/data-table-name.enum';
import { exportDataFiles } from '../../../shared-resources/export-file/common/function/export-data-files';
import { UtilityService } from '../../../utility/utility.service';
import { ReportEnum } from '../../enums/report.enum';
import { PaginationResponse } from './../../../shared-resources/ts/interface/response.interface';
import { PaginationReportAttendanceDto } from './dto/pagination-report-attendance.dto';
import { ReportAttendanceEnum } from './enum/report-attendance.enum';
import { ReportAttendanceRepository } from './repository/report-attendance.repository';
import { IReportAttendanceRepository } from './repository/interface/report-attendance.interface';
import { EmployeeWithAttendanceStatus } from './type/report-attendance.type';

@Injectable()
export class ReportAttendanceService {
  constructor(
    private readonly utilityService: UtilityService,
    @Inject(ReportAttendanceRepository)
    private readonly reportAttendanceRepository: IReportAttendanceRepository
  ) {}

  async reportAttendanceSummary(pagination: PaginationReportAttendanceDto) {
    if (pagination.date) {
      checkIsValidYearFormat(pagination.date, DEFAULT_DATE_FORMAT);
    }
    const isAdmin: boolean = await this.utilityService.checkIsAdmin();
    if (isAdmin) {
      let totalAbsents: number, totalPresent: number;
      const scanTime: Date | string =
        pagination.date ?? getCurrentDateWithFormat();
      const employees: Employee[] =
        await this.reportAttendanceRepository.getAllEmployees();
      const allFingerPrintIds: string[] = employees.map(
        (employee: Employee) => employee.fingerPrintId
      );
      const countAttendanceRecords: number =
        await this.reportAttendanceRepository.getTotalCountAttendanceRecords(
          scanTime,
          allFingerPrintIds
        );
      if (countAttendanceRecords && employees.length) {
        totalPresent = countAttendanceRecords;
        totalAbsents = employees.length - totalPresent;
        return {
          reportId: ReportEnum.DAILY_EMPLOYEE_ATTENDANCE,
          present: totalPresent,
          absent: totalAbsents
        };
      }
    }
  }

  private getResponseAllAbsents = (
    attendanceRecords: AttendanceRecord[],
    employees: Employee[]
  ): EmployeeWithAttendanceStatus[] => {
    const employeeAbsents: Employee[] = employees.filter(
      (employee: Employee) => {
        return !attendanceRecords.some(
          (attendanceRecord: AttendanceRecord) =>
            employee.fingerPrintId === attendanceRecord.fingerPrintId
        );
      }
    );
    return employeeAbsents.map((employee: Employee) => ({
      ...employee,
      attendanceStatus: ReportAttendanceEnum.ABSENT
    }));
  };

  private getResponseAllPresents = (
    attendanceRecords: AttendanceRecord[],
    employees: Employee[]
  ): EmployeeWithAttendanceStatus[] => {
    const employeePresents: Employee[] = employees.filter(
      (employee: Employee) => {
        return attendanceRecords.some(
          (attendanceRecord: AttendanceRecord) =>
            employee.fingerPrintId === attendanceRecord.fingerPrintId
        );
      }
    );
    return employeePresents.map((employee: Employee) => ({
      ...employee,
      attendanceStatus: ReportAttendanceEnum.PRESENT
    }));
  };

  private getResponseAllAbsentAndPresents = (
    attendanceRecords: AttendanceRecord[],
    employees: Employee[]
  ): EmployeeWithAttendanceStatus[] => {
    const allEmployeePresentAndAbsents = [];
    const allEmployeeAbsents: EmployeeWithAttendanceStatus[] =
      this.getResponseAllPresents(attendanceRecords, employees);
    const allEmployeePresents: EmployeeWithAttendanceStatus[] =
      this.getResponseAllAbsents(attendanceRecords, employees);
    allEmployeePresentAndAbsents.push(
      ...allEmployeeAbsents,
      ...allEmployeePresents
    );
    return allEmployeePresentAndAbsents;
  };

  async reportEmployeeCurrentDayAttendance(
    pagination: PaginationReportAttendanceDto
  ): Promise<PaginationResponse<Employee>> {
    if (pagination.date) {
      checkIsValidYearFormat(pagination.date, `${DEFAULT_DATE_FORMAT}`);
    }
    const isAdmin: boolean = await this.utilityService.checkIsAdmin();
    if (isAdmin) {
      const attendanceRecords: AttendanceRecord[] =
        await this.reportAttendanceRepository.getAttendanceRecordsByScanTime(
          pagination
        );
      const employees: Employee[] =
        await this.reportAttendanceRepository.getAllEmployees(pagination);
      const employeeWithPagination: PaginationResponse<Employee> =
        await this.reportAttendanceRepository.getReportEmployeeAttendanceWithPagination(
          pagination,
          this.getResponseAllAbsentAndPresents(attendanceRecords, employees)
        );
      let totalCount: number;
      if (pagination.type === ReportAttendanceEnum.ABSENT) {
        totalCount = this.getResponseAllAbsents(
          attendanceRecords,
          employees
        ).length;
      } else if (pagination.type === ReportAttendanceEnum.PRESENT) {
        totalCount = this.getResponseAllPresents(
          attendanceRecords,
          employees
        ).length;
      } else {
        totalCount = employeeWithPagination.totalCount;
      }
      return {
        data: employeeWithPagination.data,
        totalCount
      };
    }
  }

  async reportEmployeeCurrentDayAttendanceExport(
    pagination: PaginationReportAttendanceDto,
    exportFileDto: ExportFileDto
  ) {
    const isAdmin: boolean = await this.utilityService.checkIsAdmin();
    if (isAdmin) {
      const { data } =
        await this.reportEmployeeCurrentDayAttendance(pagination);
      return await exportDataFiles(
        pagination.exportFileType,
        DataTableNameEnum.ATTENDANCE_REPORT_DETAIL,
        exportFileDto,
        data
      );
    }
  }
}
