import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { AttendanceReport } from '../../entities/attendance-report.entity';

export interface IAttendanceReportRepository
  extends IRepositoryBase<AttendanceReport> {}
