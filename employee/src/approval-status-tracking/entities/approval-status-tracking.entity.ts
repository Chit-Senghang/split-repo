import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { RequestApprovalWorkflow } from '../../request-approval-workflow/entities/request-approval-workflow.entity';
import { RequestWorkFlowType } from '../../request-workflow-type/entities/request-workflow-type.entity';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';
import { Notification } from '../../notification/entities/notification.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { ApprovalStatusEnum } from '../common/ts/enum/approval-status.enum';

export const approvalStatusSearchableColumns = [
  'requestToUpdateBy',
  'firstApprovalUserId',
  'secondApprovalUserId',
  'acknowledgeUserId',
  'firstApprovalReason',
  'secondApprovalReason',
  'firstApprovalResult',
  'status'
];
@Entity()
export class ApprovalStatus extends AuditBaseEntity {
  @ManyToOne(
    () => RequestApprovalWorkflow,
    (requestApprovalWorkflow) => requestApprovalWorkflow.id
  )
  @JoinColumn({
    name: 'approval_workflow_id',
    foreignKeyConstraintName: 'fk_approval_status_id_approval_workflow_id'
  })
  requestApprovalWorkflow: RequestApprovalWorkflow;

  @ManyToOne(
    () => RequestWorkFlowType,
    (requestWorkFlowType) => requestWorkFlowType.approvalStatus
  )
  @JoinColumn({
    name: 'request_workflow_type_id',
    foreignKeyConstraintName: 'fk_approval_status_id_request_workflow_type'
  })
  requestWorkflowType: RequestWorkFlowType;

  @OneToMany(() => Notification, (notification) => notification.approvalStatus)
  notification: Notification[];

  @Column()
  entityId: number;

  @Column()
  requestToUpdateBy: number;

  @Column()
  employeeInfo: string;

  @Column()
  firstApprovalUserId: number;

  @Column()
  secondApprovalUserId: number;

  @Column()
  acknowledgeUserId: number;

  @Column()
  firstApprovalReason: string;

  @Column()
  secondApprovalReason: string;

  @Column()
  firstApprovalResult: boolean;

  @Column()
  secondApprovalResult: boolean;

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  firstApprovalDate: Date;

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  secondApprovalDate: Date;

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  acknowledgeDate: Date;

  @Column()
  requestToUpdateJson: string;

  @Column()
  requestToUpdateChanges: string;

  @Column()
  requestChangeOriginalJson: string;

  @Column()
  status: ApprovalStatusEnum;

  @ManyToOne(() => Employee, (employee) => employee.id)
  employee: Employee;
}
