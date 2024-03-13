import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollByStore } from '../entities/payroll-by-store.entity';
import { IPayrollByStoreRepository } from './interface/payroll-by-store.repository.interface';

@Injectable()
export class PayrollByStoreRepository
  extends RepositoryBase<PayrollByStore>
  implements IPayrollByStoreRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollByStore));
  }
}
