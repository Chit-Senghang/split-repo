import { DataSource, Raw, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DEFAULT_DATE_FORMAT } from '../../../shared-resources/common/dto/default-date-format';
import { getCurrentDateWithFormat } from '../../../shared-resources/common/utils/date-utils';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import { IAttendanceRecordRepository } from './interface/attendance-record.interface';
import { ReportAttendanceSummeryByScanTimeType } from './type/attendance-record-type';

@Injectable()
export class AttendanceRecordRepository
  extends RepositoryBase<AttendanceRecord>
  implements IAttendanceRecordRepository
{
  private readonly ATTENDANCE_RECORD = 'attendance record';

  private readonly attendanceRecordRepository: Repository<AttendanceRecord>;

  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(AttendanceRecord));
    this.attendanceRecordRepository =
      dataSource.getRepository(AttendanceRecord);
  }

  async totalAttendanceRecords(
    scanTime: Date | string,
    employeeFingerPrintIds: string[]
  ): Promise<number> {
    const attendanceRecords: [{ total_attendance_records: number }] = await this
      .query(`
      SELECT COUNT(DISTINCT(finger_print_id,TO_CHAR(scan_time, 'YYYY-MM-DD'))) AS total_attendance_records
      FROM attendance_record
        WHERE
        TO_CHAR(scan_time, 'YYYY-MM-DD') = '${scanTime}'
        OR
        finger_print_id  IN('${employeeFingerPrintIds}');  
    `);
    return attendanceRecords.at(0).total_attendance_records;
  }

  async findReportAttendanceSummeryByScanTime(
    option: ReportAttendanceSummeryByScanTimeType
  ): Promise<AttendanceRecord[]> {
    const currentDate: string = getCurrentDateWithFormat();
    if (!option.scanTime) {
      option.scanTime = currentDate;
    }
    return await this.find({
      where: {
        scanTime: Raw(
          (scanTime) =>
            `TO_CHAR(${scanTime}, '${DEFAULT_DATE_FORMAT}') = '${option.scanTime}'`
        )
      }
    });
  }

  async getAttendanceRecordById(id: number): Promise<AttendanceRecord> {
    const attendanceRecord: AttendanceRecord | null =
      await this.attendanceRecordRepository.findOne({
        where: { id },
        relations: {
          companyStructureOutletId: { companyStructureComponent: true }
        }
      });

    if (!attendanceRecord) {
      throw new ResourceNotFoundException(this.ATTENDANCE_RECORD, id);
    }

    attendanceRecord['companyStructureOutlet'] = {
      id: attendanceRecord.companyStructureOutletId.id,
      name: attendanceRecord.companyStructureOutletId.companyStructureComponent
        .name,
      nameKh:
        attendanceRecord.companyStructureOutletId.companyStructureComponent
          .nameKh,
      type: attendanceRecord.companyStructureOutletId.companyStructureComponent
        .type
    };

    return attendanceRecord;
  }
}
