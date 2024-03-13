import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BenefitComponentType } from '../../benefit-component-type/entities/benefit-component-type.entity';
import { AuditBaseEntityWithoutDeletedAt } from '../../shared-resources/entity/audit-base-without-deleted-at.entity';

export const benefitComponentSearchableColumns = ['name', 'nameKhmer'];
@Entity()
export class BenefitComponent extends AuditBaseEntityWithoutDeletedAt {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  nameKhmer: string;

  @ManyToOne(
    () => BenefitComponentType,
    (benefitComponentType) => benefitComponentType.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_salary_component_type_id_salary_component_type_id',
    name: 'salary_component_type_id'
  })
  benefitComponentType: BenefitComponentType;

  @Column()
  isSystemDefined: boolean;

  @Column({ type: 'boolean', default: false })
  isFixed: boolean;
}
