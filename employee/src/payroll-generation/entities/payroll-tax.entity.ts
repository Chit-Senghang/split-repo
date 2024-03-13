import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { PayrollReport } from './payroll-report.entity';

@Entity('payroll_tax')
export class PayrollTax extends AuditBaseEntity {
  @Column({ type: 'boolean' })
  spouse: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  forDependent: number;

  @Column({ type: 'integer' })
  children: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basisAmount: number;

  @Column({ type: 'integer' })
  percent: number;

  @OneToOne(() => PayrollReport, (payrollReport) => payrollReport.id)
  @JoinColumn({ name: 'payroll_id', foreignKeyConstraintName: 'fk_payroll_id' })
  payrollReport: PayrollReport;
}
