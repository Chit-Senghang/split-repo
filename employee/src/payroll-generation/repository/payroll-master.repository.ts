import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollMaster } from '../entities/payroll-master.entity';
import { IPayrollMasterRepository } from './interface/payroll-master.repository.interface';

@Injectable()
export class PayrollMasterRepository
  extends RepositoryBase<PayrollMaster>
  implements IPayrollMasterRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollMaster));
  }
}
