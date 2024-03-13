import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { BenefitComponentType } from '../entities/benefit-component-type.entity';
import { IBenefitComponentTypeRepository } from './interface/benefit-component-type.repository.interface';

@Injectable()
export class BenefitComponentRepository
  extends RepositoryBase<BenefitComponentType>
  implements IBenefitComponentTypeRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(BenefitComponentType));
  }
}
