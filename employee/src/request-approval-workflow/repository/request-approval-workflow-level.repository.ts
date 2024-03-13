import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { RequestApprovalWorkflowLevel } from '../entities/request-approval-workflow-level.entity';
import { IRequestApprovalWorkflowLevelRepository } from './interface/request-approval-workflow-level.repository.interface';

@Injectable()
export class RequestApprovalWorkflowLevelRepository
  extends RepositoryBase<RequestApprovalWorkflowLevel>
  implements IRequestApprovalWorkflowLevelRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(RequestApprovalWorkflowLevel));
  }
}
