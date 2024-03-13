import { FindOptionsWhere, ILike, In, Raw } from 'typeorm';
import { Inject } from '@nestjs/common';
import { AttendanceRecord } from '../../../../../../employee/src/attendance/attendance-record/entities/attendance-record.entity';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { getCurrentDateWithFormat } from '../../../../shared-resources/common/utils/date-utils';
import { PaginationReportAttendanceDto } from '../dto/pagination-report-attendance.dto';
import { EmployeeWithAttendanceStatus } from '../type/report-attendance.type';
import { PaginationResponse } from './../../../../shared-resources/ts/interface/response.interface';
import { DEFAULT_DATE_FORMAT } from './../../../../shared-resources/common/dto/default-date-format';
import { IAttendanceRecordRepository } from './../../../../attendance/attendance-record/repository/interface/attendance-record.interface';
import { IEmployeeRepository } from './../../../../employee/repository/interface/employee.repository.interface';
import { AttendanceRecordRepository } from './../../../../attendance/attendance-record/repository/attendance-record.repository';
import { EmployeeRepository } from './../../../../employee/repository/employee.repository';
import { EmployeeActiveStatusEnum } from './../../../../employee/enum/employee-status.enum';
import { IReportAttendanceRepository } from './interface/report-attendance.interface';

export class ReportAttendanceRepository implements IReportAttendanceRepository {
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(AttendanceRecordRepository)
    private readonly attendanceRecordRepo: IAttendanceRecordRepository
  ) {}

  private getEmployeeFilterConditions(
    pagination: PaginationReportAttendanceDto
  ): FindOptionsWhere<Employee> {
    return {
      status: In(Object.values(EmployeeActiveStatusEnum)),
      contacts: {
        contact: pagination?.contactNumber
      },
      accountNo: pagination?.accountNo,
      gender: {
        id: pagination?.genderId
      },
      positions: {
        isDefaultPosition: true,
        isMoved: false,
        companyStructureCompany: {
          id: pagination?.companyId
        },
        companyStructureLocation: {
          id: pagination?.locationId
        },
        companyStructureOutlet: {
          id: pagination?.outletId
        },
        companyStructureDepartment: {
          id: pagination?.departmentId
        },
        companyStructureTeam: {
          id: pagination?.teamId
        },
        companyStructurePosition: {
          id: pagination?.positionId
        }
      }
    };
  }

  async getAllEmployees(
    pagination?: PaginationReportAttendanceDto
  ): Promise<Employee[]> {
    return await this.employeeRepo.find({
      where: {
        ...this.getEmployeeFilterConditions(pagination)
      },
      select: this.employeeRepo.findOptionsSelect,
      relations: this.employeeRepo.findOptionsRelations
    });
  }

  async getAttendanceRecordsByScanTime(
    pagination: PaginationReportAttendanceDto
  ): Promise<AttendanceRecord[]> {
    const currentDate: string = getCurrentDateWithFormat();
    return await this.attendanceRecordRepo.find({
      where: {
        scanTime: Raw(
          (date: string) =>
            `TO_CHAR(${date}, '${DEFAULT_DATE_FORMAT}') = '${
              pagination.date ?? currentDate
            }'`
        )
      }
    });
  }

  async getTotalCountAttendanceRecords(
    scanTime: Date | string,
    allFingerPrintIds: string[]
  ): Promise<number> {
    return await this.attendanceRecordRepo.totalAttendanceRecords(
      scanTime,
      allFingerPrintIds
    );
  }

  private checkOrderByAttendanceStatus = (
    employeesPresentAndAbsents: EmployeeWithAttendanceStatus[],
    pagination: PaginationReportAttendanceDto
  ): EmployeeWithAttendanceStatus[] => {
    if (pagination.orderBy === 'status') {
      return employeesPresentAndAbsents.sort((a: any, b: any) => {
        const statusA: string = a.attendanceStatus;
        const statusB: string = b.attendanceStatus;
        return pagination.orderDirection === 'ASC'
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      });
    } else {
      return employeesPresentAndAbsents;
    }
  };

  async getReportEmployeeAttendanceWithPagination(
    pagination: PaginationReportAttendanceDto,
    allAbsentAndPresents: EmployeeWithAttendanceStatus[]
  ): Promise<PaginationResponse<Employee>> {
    return await this.employeeRepo.findAllWithPagination(pagination, [], {
      where: [
        {
          ...this.getEmployeeFilterConditions(pagination),
          displayFullNameEn:
            pagination.displayName && ILike(`%${pagination.displayName}%`)
        },
        {
          ...this.getEmployeeFilterConditions(pagination),
          displayFullNameKh:
            pagination.displayName && ILike(`%${pagination.displayName}%`)
        }
      ] as FindOptionsWhere<Employee>,
      select: this.employeeRepo.findOptionsSelect,
      relation: this.employeeRepo.findOptionsRelations,
      mapFunction: (employee: Employee) => {
        const employeesPresentAndAbsentWithOrder: EmployeeWithAttendanceStatus[] =
          this.checkOrderByAttendanceStatus(allAbsentAndPresents, pagination);

        return employeesPresentAndAbsentWithOrder.find(
          (employeePresentAndAbsent) =>
            employeePresentAndAbsent.fingerPrintId === employee.fingerPrintId &&
            (pagination.type
              ? employeePresentAndAbsent.attendanceStatus === pagination.type
              : true)
        );
      }
    });
  }
}
