import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { ReasonTemplate } from '../entities/reason-template.entity';
import { IReasonTemplateRepository } from './interface/reason-template.repository.interface';

@Injectable()
export class ReasonTemplateRepository
  extends RepositoryBase<ReasonTemplate>
  implements IReasonTemplateRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(ReasonTemplate));
  }
}
