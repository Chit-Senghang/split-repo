import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollReport } from '../entities/payroll-report.entity';
import { IPayrollReportRepository } from './interface/payroll-report.repository.interface';

@Injectable()
export class PayrollReportRepository
  extends RepositoryBase<PayrollReport>
  implements IPayrollReportRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollReport));
  }
}
