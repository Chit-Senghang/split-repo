import { FindOptionsSelect } from 'typeorm';
import { ApprovalStatus } from '../entities/approval-status-tracking.entity';

export const APPROVAL_STATUS_SELECTED_FIELDS = {
  requestApprovalWorkflow: {
    id: true,
    requestWorkflowLevel: {
      id: true,
      type: true,
      positionLevel: { id: true, levelNumber: true, levelTitle: true }
    }
  },
  requestWorkflowType: {
    id: true,
    requestType: true,
    description: true
  }
} as FindOptionsSelect<ApprovalStatus>;
