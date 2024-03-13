import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { BenefitComponent } from '../entities/benefit-component.entity';
import { IBenefitComponentRepository } from './interface/benefit-component.repository.interface';

@Injectable()
export class BenefitComponentRepository
  extends RepositoryBase<BenefitComponent>
  implements IBenefitComponentRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(BenefitComponent));
  }
}
