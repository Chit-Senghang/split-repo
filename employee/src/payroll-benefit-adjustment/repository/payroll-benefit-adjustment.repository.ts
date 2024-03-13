import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PayrollBenefitAdjustment } from '../entities/payroll-benefit-adjustment.entity';
import { IPayrollBenefitAdjustmentRepository } from './interface/payroll-benefit-adjustment.repository.interface';

@Injectable()
export class PayrollBenefitAdjustmentRepository
  extends RepositoryBase<PayrollBenefitAdjustment>
  implements IPayrollBenefitAdjustmentRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollBenefitAdjustment));
  }
}
