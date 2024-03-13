import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { BenefitIncreasementPolicy } from '../entities/benefit-increasement-policy.entity';
import { IBenefitIncreasementPolicyRepository } from './interface/benefit-increasement-policy.repository.interface';

@Injectable()
export class BenefitIncreasementPolicyRepository
  extends RepositoryBase<BenefitIncreasementPolicy>
  implements IBenefitIncreasementPolicyRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(BenefitIncreasementPolicy));
  }
}
