import { Column, Entity } from 'typeorm';
import { AuditBaseOnlyCreatedByAndCreatedAt } from '../../shared-resources/entity/audit-base-only-createdat-createdby.entity';

@Entity()
export class AuditLog extends AuditBaseOnlyCreatedByAndCreatedAt {
  @Column()
  requestMethod: string;

  @Column()
  requestUrl: string;

  @Column()
  requestJson: string;

  @Column()
  ipAddress: string;

  @Column()
  resourceId: number;
}
