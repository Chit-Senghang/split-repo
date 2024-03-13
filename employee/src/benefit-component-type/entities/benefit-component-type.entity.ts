import { Column, Entity } from 'typeorm';
import { AuditBaseEntityWithoutDeletedAt } from '../../shared-resources/entity/audit-base-without-deleted-at.entity';

export const salaryComponentTypeSearchableColumns = ['name'];
@Entity({ name: 'benefit_component_type' })
export class BenefitComponentType extends AuditBaseEntityWithoutDeletedAt {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', default: 0 })
  taxPercentage: number;

  @Column()
  isSystemDefined: boolean;
}
