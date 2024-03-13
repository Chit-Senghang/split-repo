import { Inject, Injectable, Logger } from '@nestjs/common';
import { Between, FindOperator, Raw } from 'typeorm';
import * as EmployeeProto from '../../shared-resources/proto/employee/employee.pb';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import {
  checkIsValidYearFormat,
  validateDateTimeFormat
} from '../../shared-resources/utils/validate-date-format';
import {
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../shared-resources/common/utils/date-utils';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { ICompanyStructureRepository } from '../../company-structure/repository/interface/company-structure.repository.interface';
import { CompanyStructureRepository } from '../../company-structure/repository/company-structure.repository';
import { AttendanceReportService } from '../attendance-report/attendance-report.service';
import { Employee } from '../../employee/entity/employee.entity';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { UpdateAttendanceRecordDto } from './dto/update-attendance-record.dto';
import { PaginationQueryAttendanceRecordDto } from './dto/pagination-query-attendance-record.dto';
import {
  AttendanceRecord,
  attendanceRecordSearchableColumns
} from './entities/attendance-record.entity';
import { AttendanceRecordRepository } from './repository/attendance-record.repository';
import { IAttendanceRecordRepository } from './repository/interface/attendance-record.interface';

@Injectable()
export class AttendanceRecordService {
  constructor(
    @Inject(CompanyStructureRepository)
    private readonly companyStructureRepo: ICompanyStructureRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(AttendanceRecordRepository)
    private readonly attendanceRecordRepo: IAttendanceRecordRepository,
    private readonly attendanceReportService: AttendanceReportService
  ) {}

  async create(
    createAttendanceRecordDto: CreateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    try {
      const attendanceRecord = this.attendanceRecordRepo.create({
        companyStructureOutletId: {
          id: createAttendanceRecordDto.companyStructureOutletId
        },
        fingerPrintId: createAttendanceRecordDto.fingerPrintId,
        scanTime: createAttendanceRecordDto.scanTime
          ? dayJs(createAttendanceRecordDto.scanTime)
              .utc(true)
              .format(DEFAULT_DATE_TIME_FORMAT)
          : null
      });

      return await this.attendanceRecordRepo.save(attendanceRecord);
    } catch (error) {
      Logger.log(error);
    }
  }

  async grpcCreateAttendanceRecord(attendanceRecord: {
    data: EmployeeProto.AttendanceRecord[];
  }): Promise<{ data: number }> {
    Logger.log('start create attendance record.');

    for (const item of attendanceRecord.data) {
      await this.create(item);
    }
    // last scan
    const lastScan = attendanceRecord.data.at(-1);
    const companyStructure = await this.companyStructureRepo.findOne({
      where: { id: lastScan.companyStructureOutletId }
    });

    // update lastRetrieveDate
    const data = await this.companyStructureRepo.save(
      Object.assign(companyStructure, {
        lastRetrieveDate: lastScan.scanTime
      })
    );
    Logger.log('finish create attendance record.');
    return { data: data.id };
  }

  async exportFile(
    pagination: PaginationQueryAttendanceRecordDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.ATTENDANCE_RECORD,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationQueryAttendanceRecordDto
  ): Promise<PaginationResponse<AttendanceRecord>> {
    if (pagination.fromDate || pagination.toDate) {
      if (pagination.fromDate && !pagination.toDate) {
        throw new ResourceNotFoundException(
          `You need to add query fromDate and toDate format(YYYY-MM-DD)`
        );
      }
    }

    if (pagination.toDate && !pagination.fromDate) {
      throw new ResourceNotFoundException(
        `You need to add query fromDate and toDate format(${DEFAULT_DATE_FORMAT})`
      );
    }

    if (pagination.fromTime || pagination.toTime) {
      if (pagination.fromTime && !pagination.toTime) {
        throw new ResourceNotFoundException(
          `You need to add query fromTime and toTime format(${DEFAULT_TIME_FORMAT})`
        );
      }
    }
    if (pagination.toTime && !pagination.fromTime) {
      throw new ResourceNotFoundException(
        `You need to add query fromTime and toTime format(${DEFAULT_TIME_FORMAT})`
      );
    }

    if (pagination.fromDate) {
      checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.toDate) {
      checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.fromTime) {
      checkIsValidYearFormat(pagination.fromTime, DEFAULT_TIME_FORMAT);
    }

    if (pagination.toTime) {
      checkIsValidYearFormat(pagination.toTime, DEFAULT_TIME_FORMAT);
    }

    let fingerPrintId: FindOperator<string> | undefined | string;
    if (pagination.fingerPrintId) {
      const employee =
        await this.employeeRepo.getOneEmployeeByProvidedCondition({
          fingerPrintId: pagination.fingerPrintId
        });
      fingerPrintId = employee?.fingerPrintId;
    }

    if (pagination.employeeId) {
      const employee =
        await this.employeeRepo.getOneEmployeeByProvidedCondition({
          id: pagination.employeeId
        });

      fingerPrintId = employee?.fingerPrintId;
    }

    let scanTimeCondition: Date | FindOperator<Date>;
    if (
      pagination.fromDate &&
      pagination.toDate &&
      pagination.fromTime &&
      pagination.toTime
    ) {
      scanTimeCondition = Raw((alias) => {
        return `
          TO_CHAR(${alias}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.fromDate}' AND '${pagination.toDate}'
          AND TO_CHAR(${alias}, 'HH24:MI:SS') BETWEEN '${pagination.fromTime}' AND '${pagination.toTime}'
        `;
      });
    } else if (pagination.fromDate && pagination.toDate) {
      scanTimeCondition = Raw((alias) => {
        return `TO_CHAR(${alias}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.fromDate}' AND '${pagination.toDate}'`;
      });
    } else if (pagination.fromTime && pagination.toTime) {
      scanTimeCondition = Raw((alias) => {
        return `TO_CHAR(${alias}, 'HH24:MI:SS') BETWEEN '${pagination.fromTime}' AND '${pagination.toTime}'`;
      });
    } else {
      const currentDate = getCurrentDateWithFormat();
      scanTimeCondition = Between(
        dayJs(currentDate).startOf('month').format(DEFAULT_DATE_FORMAT),
        dayJs(currentDate).endOf('month').format(DEFAULT_DATE_FORMAT)
      ) as FindOperator<any>;
    }

    return await this.attendanceRecordRepo.findAllWithPagination(
      pagination,
      attendanceRecordSearchableColumns,
      {
        relation: {
          companyStructureOutletId: {
            companyStructureComponent: true
          }
        },
        select: {
          companyStructureOutletId: {
            id: true,
            companyStructureComponent: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: !pagination.orderBy && { scanTime: 'DESC' },
        where: {
          fingerPrintId,
          isMissedScan: pagination.isMissedScan,
          scanTime: scanTimeCondition,
          companyStructureOutletId: {
            id: pagination.companyStructureStoreId
          }
        }
      }
    );
  }

  async findOne(id: number): Promise<AttendanceRecord> {
    return await this.attendanceRecordRepo.getAttendanceRecordById(id);
  }

  async update(
    id: number,
    updateAttendanceRecordDto: UpdateAttendanceRecordDto
  ) {
    const scanTimeAdjustment: string = validateDateTimeFormat(
      updateAttendanceRecordDto.scanTime
    );

    const attendanceRecord: AttendanceRecord =
      await this.attendanceRecordRepo.getAttendanceRecordById(id);

    const oldScanTime = attendanceRecord.scanTime;

    const attendanceRecordUpdate = Object.assign(attendanceRecord, {
      scanTime: scanTimeAdjustment
    });

    if (!attendanceRecord.beforeAdjustment) {
      attendanceRecordUpdate.beforeAdjustment = oldScanTime;
    }

    const updated = await this.attendanceRecordRepo.save(
      attendanceRecordUpdate
    );

    await this.recalculateAttendanceReportForBackDateAdjustment(
      attendanceRecord
    );

    return updated;
  }

  async delete(id: number): Promise<void> {
    const attendanceRecord = await this.findOne(id);
    await this.attendanceRecordRepo.delete(attendanceRecord.id);
  }

  async findLatestRecord(id: number) {
    const attendanceRecord = await this.attendanceRecordRepo.find({
      where: { companyStructureOutletId: { id } },
      order: { createdAt: 'DESC' },
      take: 1
    });
    if (attendanceRecord.length < 1) {
      throw new ResourceNotFoundException(
        `Resource of attendance record with outlet ${id} not found`
      );
    }
    return attendanceRecord[0];
  }

  private async recalculateAttendanceReportForBackDateAdjustment(
    attendanceRecord: AttendanceRecord
  ) {
    const employee: Employee | null = await this.employeeRepo.findOneBy({
      fingerPrintId: attendanceRecord.fingerPrintId
    });

    if (employee) {
      await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
        employee.id,
        dayJs(attendanceRecord.scanTime).startOf('day').toDate()
      );
    }
  }
}
