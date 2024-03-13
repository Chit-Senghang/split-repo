import { Column, Entity, OneToMany } from 'typeorm';
import { AuditBaseEntityWithoutDeletedAt } from '../../shared-resources/entity/audit-base-without-deleted-at.entity';
import { PayrollDeduction } from '../../payroll-deduction/entities/payroll-deduction.entity';

@Entity()
export class PayrollDeductionType extends AuditBaseEntityWithoutDeletedAt {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column()
  isSystemDefined: boolean;

  @OneToMany(
    () => PayrollDeduction,
    (payrollDeduction) => payrollDeduction.payrollDeductionType
  )
  payrollDeduction: PayrollDeduction;
}
