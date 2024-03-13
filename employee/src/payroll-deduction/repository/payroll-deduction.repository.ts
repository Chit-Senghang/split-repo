import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollDeduction } from '../entities/payroll-deduction.entity';
import { IPayrollDeductionRepository } from './interface/payroll-deduction.repository.interface';

@Injectable()
export class PayrollDeductionRepository
  extends RepositoryBase<PayrollDeduction>
  implements IPayrollDeductionRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollDeduction));
  }
}
