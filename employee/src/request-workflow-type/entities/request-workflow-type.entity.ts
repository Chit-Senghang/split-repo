import { Column, Entity, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { RequestApprovalWorkflow } from '../../request-approval-workflow/entities/request-approval-workflow.entity';
import { ApprovalStatus } from '../../approval-status-tracking/entities/approval-status-tracking.entity';

export const requestWorkFlowTypeSearchableColumns = ['requestType'];

@Entity()
export class RequestWorkFlowType extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  requestType: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @OneToMany(
    () => RequestApprovalWorkflow,
    (requestApprovalWorkflow) => requestApprovalWorkflow.requestWorkflowType
  )
  requestWorkflow: RequestApprovalWorkflow[];

  @OneToMany(
    () => ApprovalStatus,
    (ApprovalStatus) => ApprovalStatus.requestWorkflowType
  )
  approvalStatus: ApprovalStatus[];
}
