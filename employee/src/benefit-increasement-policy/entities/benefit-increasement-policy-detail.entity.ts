import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntityWithoutDeletedAt } from '../../shared-resources/entity/audit-base-without-deleted-at.entity';
import { BenefitComponent } from '../../benefit-component/entities/benefit-component.entity';
import { BenefitIncreasementPolicy } from './benefit-increasement-policy.entity';

@Entity()
export class BenefitIncreasementPolicyDetail extends AuditBaseEntityWithoutDeletedAt {
  @Column({ type: 'decimal', default: 0 })
  increasementAmount: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @ManyToOne(
    () => BenefitIncreasementPolicy,
    (benefitIncreasementPolicy) => benefitIncreasementPolicy.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_benefit_increasement_policy_benefit_increasement_policy_id',
    name: 'benefit_increasement_policy_id'
  })
  benefitIncreasementPolicy: BenefitIncreasementPolicy;

  @ManyToOne(() => BenefitComponent, (benefitComponent) => benefitComponent.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_benefit_component_benefit_component_id',
    name: 'benefit_component_id'
  })
  benefitComponent: BenefitComponent;
}
