import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { AttendanceReport } from './../entities/attendance-report.entity';
import { IAttendanceReportRepository } from './interface/attendance-report.repository.interface';

@Injectable()
export class AttendanceReportRepository
  extends RepositoryBase<AttendanceReport>
  implements IAttendanceReportRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(AttendanceReport));
  }
}
