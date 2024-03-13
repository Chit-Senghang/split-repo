import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { RequestApprovalWorkflow } from '../entities/request-approval-workflow.entity';
import { IRequestApprovalWorkflowRepository } from './interface/request-approval-workflow.repository.interface';

@Injectable()
export class RequestApprovalWorkflowRepository
  extends RepositoryBase<RequestApprovalWorkflow>
  implements IRequestApprovalWorkflowRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(RequestApprovalWorkflow));
  }
}
