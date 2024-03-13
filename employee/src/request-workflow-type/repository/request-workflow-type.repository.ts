import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { RequestWorkFlowType } from '../entities/request-workflow-type.entity';
import { IRequestWorkFlowTypeRepository } from './interface/request-workflow-type.repository.interface';

@Injectable()
export class RequestWorkFlowTypeRepository
  extends RepositoryBase<RequestWorkFlowType>
  implements IRequestWorkFlowTypeRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(RequestWorkFlowType));
  }
}
