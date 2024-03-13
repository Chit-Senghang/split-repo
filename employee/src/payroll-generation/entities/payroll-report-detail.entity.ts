import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { PayrollReport } from './payroll-report.entity';

@Entity('payroll_report_detail')
export class PayrollReportDetail extends AuditBaseEntity {
  @Column('decimal', { nullable: true, precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 50 })
  type: string;

  @Column()
  typeId: number;

  @ManyToOne(() => PayrollReport)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_payroll_report_id',
    name: 'payroll_report_id'
  })
  payrollReport: PayrollReport;
}
