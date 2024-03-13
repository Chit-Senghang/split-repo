import { Column, Entity } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity('adjustment_type')
export class BenefitAdjustmentType extends AuditBaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'boolean' })
  isSystemDefined: boolean;
}
