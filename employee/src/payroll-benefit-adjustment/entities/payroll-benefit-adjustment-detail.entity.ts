import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { BenefitComponent } from '../../benefit-component/entities/benefit-component.entity';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';
import { AdjustmentDetailStatusEnum } from '../enum/status.enum';
import { PayrollBenefitAdjustment } from './payroll-benefit-adjustment.entity';

@Entity()
export class PayrollBenefitAdjustmentDetail extends AuditBaseEntity {
  @ManyToOne(() => PayrollBenefitAdjustment)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_payroll_benefit_adjustment_id',
    name: 'payroll_benefit_adjustment_id'
  })
  payrollBenefitAdjustment: PayrollBenefitAdjustment;

  @ManyToOne(() => BenefitComponent)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_salary_component_id',
    name: 'benefit_component_id'
  })
  benefitComponent: BenefitComponent;

  @Column()
  adjustAmount: number;

  @Column({
    type: 'timestamp without time zone',
    transformer: new DateTimeTransformer()
  })
  effectiveDateFrom: Date;

  @Column({
    type: 'timestamp without time zone',
    transformer: new DateTimeTransformer()
  })
  effectiveDateTo: Date;

  @Column()
  status: AdjustmentDetailStatusEnum;

  @Column()
  isPostProbation: boolean;
}
