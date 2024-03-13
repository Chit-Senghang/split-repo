import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { RequestApprovalWorkflow } from '../../entities/request-approval-workflow.entity';

export interface IRequestApprovalWorkflowRepository
  extends IRepositoryBase<RequestApprovalWorkflow> {}
