import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Seniority } from '../entities/seniority.entity';
import { ISeniorityRepository } from './interface/seniority.repository.interface';

@Injectable()
export class SeniorityRepository
  extends RepositoryBase<Seniority>
  implements ISeniorityRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Seniority));
  }
}
