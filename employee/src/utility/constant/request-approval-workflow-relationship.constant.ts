import { FindOptionsRelations } from 'typeorm';
import { RequestApprovalWorkflowLevel } from '../../request-approval-workflow/entities/request-approval-workflow-level.entity';

export const REQUEST_APPROVAL_WORKFLOW_RELATIONSHIP = {
  positionLevel: true,
  companyStructureDepartment: true,
  companyStructureTeam: true,
  requestApprovalWorkflow: { requestWorkflowType: true }
} as FindOptionsRelations<RequestApprovalWorkflowLevel>;
