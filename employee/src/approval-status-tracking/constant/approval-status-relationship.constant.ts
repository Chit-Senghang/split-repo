import { FindOptionsRelations } from 'typeorm';
import { ApprovalStatus } from '../entities/approval-status-tracking.entity';

export const APPROVAL_STATUS_RELATIONSHIP = {
  requestWorkflowType: true,
  requestApprovalWorkflow: {
    requestWorkflowLevel: {
      positionLevel: true,
      companyStructureDepartment: true,
      companyStructureTeam: true
    }
  }
} as FindOptionsRelations<ApprovalStatus>;
