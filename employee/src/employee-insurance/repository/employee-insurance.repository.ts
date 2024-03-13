import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeInsurance } from '../entities/employee-insurance.entity';
import { IEmployeeInsuranceRepository } from './interface/employee-insurance.repository.interface';

@Injectable()
export class EmployeeInsuranceRepository
  extends RepositoryBase<EmployeeInsurance>
  implements IEmployeeInsuranceRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeInsurance));
  }
}
