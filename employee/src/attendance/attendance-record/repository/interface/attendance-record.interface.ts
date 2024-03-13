import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { AttendanceRecord } from '../../entities/attendance-record.entity';
import { ReportAttendanceSummeryByScanTimeType } from '../type/attendance-record-type';

export interface IAttendanceRecordRepository
  extends IRepositoryBase<AttendanceRecord> {
  getAttendanceRecordById(id: number): Promise<AttendanceRecord>;
  findReportAttendanceSummeryByScanTime(
    option: ReportAttendanceSummeryByScanTimeType
  ): Promise<AttendanceRecord[]>;

  totalAttendanceRecords(
    scanTime: Date | string,
    employeeFingerPrintIds: string[]
  ): Promise<number>;
}
