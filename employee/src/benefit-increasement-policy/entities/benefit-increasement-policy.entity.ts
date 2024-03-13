import { Column, Entity, OneToMany } from 'typeorm';
import { AuditBaseEntityWithoutDeletedAt } from '../../shared-resources/entity/audit-base-without-deleted-at.entity';
import { BenefitIncreasementPolicyDetail } from './benefit-increasement-policy-detail.entity';

@Entity()
export class BenefitIncreasementPolicy extends AuditBaseEntityWithoutDeletedAt {
  @Column({ length: 255, type: 'varchar' })
  name: string;

  @OneToMany(
    () => BenefitIncreasementPolicyDetail,
    (benefitIncreasementPolicyDetail) =>
      benefitIncreasementPolicyDetail.benefitIncreasementPolicy
  )
  benefitIncreasementPolicyDetail: BenefitIncreasementPolicyDetail[];
}
