import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeePaymentMethodAccount } from '../entities/employee-payment-method-account.entity';
import { IEmployeePaymentMethodAccountRepository } from './interface/employee-payment-method-account.repository.interface';

@Injectable()
export class EmployeePaymentMethodAccountRepository
  extends RepositoryBase<EmployeePaymentMethodAccount>
  implements IEmployeePaymentMethodAccountRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeePaymentMethodAccount));
  }
}
