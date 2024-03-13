import { Column, Entity, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { ApprovalStatus } from '../../approval-status-tracking/entities/approval-status-tracking.entity';

@Entity()
export class Notification extends AuditBaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  isRead: boolean;

  @Column()
  entityType: string;

  @Column()
  entityId: number;

  @ManyToOne(() => ApprovalStatus, (approvalStatus) => approvalStatus.id)
  approvalStatus: ApprovalStatus;

  @Column()
  userId: number;
}
