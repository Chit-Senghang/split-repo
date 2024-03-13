import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollReportDetail } from '../entities/payroll-report-detail.entity';
import { IPayrollReportDetailRepository } from './interface/payroll-report-detail.repository.interface';

@Injectable()
export class PayrollReportDetailRepository
  extends RepositoryBase<PayrollReportDetail>
  implements IPayrollReportDetailRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollReportDetail));
  }
}
