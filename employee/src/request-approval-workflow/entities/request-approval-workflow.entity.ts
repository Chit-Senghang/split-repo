import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { RequestWorkFlowType } from '../../request-workflow-type/entities/request-workflow-type.entity';
import { RequestApprovalWorkflowLevel } from './request-approval-workflow-level.entity';

@Entity()
export class RequestApprovalWorkflow extends AuditBaseEntity {
  @Column()
  enable: boolean;

  @Column()
  description: string;

  @ManyToOne(
    () => RequestWorkFlowType,
    (RequestWorkFlowType) => RequestWorkFlowType.requestWorkflow
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_request_approval_workflow_id_request_workflow_type_id',
    name: 'request_workflow_type_id'
  })
  requestWorkflowType: RequestWorkFlowType;

  @OneToMany(
    () => RequestApprovalWorkflowLevel,
    (RequestApprovalWorkflowLevel) =>
      RequestApprovalWorkflowLevel.requestApprovalWorkflow,
    { eager: true }
  )
  requestWorkflowLevel: RequestApprovalWorkflowLevel[];
}
