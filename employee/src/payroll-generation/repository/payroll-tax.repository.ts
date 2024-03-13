import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollTax } from '../entities/payroll-tax.entity';
import { IPayrollTaxRepository } from './interface/payroll-tax.repository.interface';

@Injectable()
export class PayrollTaxRepository
  extends RepositoryBase<PayrollTax>
  implements IPayrollTaxRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollTax));
  }
}
