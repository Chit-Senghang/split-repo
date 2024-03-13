import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';

export const overtimeRequestTypeSearchableColumns = ['name'];
@Entity()
export class OvertimeRequestType extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', default: 0 })
  percentagePerHour: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
