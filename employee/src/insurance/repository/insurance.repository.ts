import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Insurance } from '../entities/insurance.entity';
import { IInsuranceRepository } from './interface/insurance.repository.interface';

@Injectable()
export class InsuranceRepository
  extends RepositoryBase<Insurance>
  implements IInsuranceRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Insurance));
  }
}
