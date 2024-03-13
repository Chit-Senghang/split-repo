import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { PayrollCycleConfiguration } from '../entities/payroll-cycle-configuration.entity';
import { IPayrollCycleConfiguration } from './interfaces/payroll-cycle-configuration.repository.interface';

@Injectable()
export class PayrollCycleConfigurationRepository
  extends RepositoryBase<PayrollCycleConfiguration>
  implements IPayrollCycleConfiguration
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PayrollCycleConfiguration));
  }

  async getOneWithNotFound(): Promise<PayrollCycleConfiguration> {
    const payrollCycleConfigurations = await this.find();
    if (!payrollCycleConfigurations.length) {
      throw new ResourceNotFoundException('payroll cycle configuration');
    }
    return payrollCycleConfigurations.at(0);
  }
}
