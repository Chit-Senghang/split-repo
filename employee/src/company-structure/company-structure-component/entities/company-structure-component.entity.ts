import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { CompanyStructureTypeEnum } from '../../common/ts/enum/structure-type.enum';
import { CompanyStructure } from '../../entities/company-structure.entity';
import { BenefitIncreasementPolicy } from '../../../benefit-increasement-policy/entities/benefit-increasement-policy.entity';

@Entity()
export class CompanyStructureComponent extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column()
  type: CompanyStructureTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  nameKh: string;

  @OneToMany(
    () => CompanyStructure,
    (companyStrucutre) => companyStrucutre.companyStructureComponent
  )
  companyStructure: CompanyStructure[];

  @ManyToOne(
    () => BenefitIncreasementPolicy,
    (postProbationBenefitIncreasementPolicy) =>
      postProbationBenefitIncreasementPolicy.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_component_post_probation_benefit_increasement_policy_id',
    name: 'post_probation_benefit_increasement_policy_id'
  })
  postProbationBenefitIncreasementPolicy: BenefitIncreasementPolicy;
}
