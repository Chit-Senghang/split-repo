import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollDeductionType } from '../entities/payroll-deduction-type.entity';
import { IPayrollDeductionTypeRepository } from './interface/payroll-deduction-type.repository.interface';

@Injectable()
export class PayrollDeductionTypeRepository
  extends RepositoryBase<PayrollDeductionType>
  implements IPayrollDeductionTypeRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollDeductionType));
  }
}
