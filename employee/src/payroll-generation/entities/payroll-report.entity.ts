import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Employee } from '../../employee/entity/employee.entity';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { PayrollReportDetail } from './payroll-report-detail.entity';
import { PayrollByStore } from './payroll-by-store.entity';

@Entity('payroll_report')
export class PayrollReport extends AuditBaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  benefit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basicSalary: number;

  @Column()
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basicSalary2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  proratePerDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  seniority: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalMonthly: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalMonthlyRound: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pensionFund: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalExcludePension: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salaryTaxWithHeld: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  nonTaxSeniority: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  attendanceAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  attendanceAllowanceByConfiguration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netTotal: number;

  @ManyToOne(() => Employee)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @OneToMany(
    () => PayrollReportDetail,
    (payrollReportDetail) => payrollReportDetail.payrollReport
  )
  payrollReportDetail: PayrollReportDetail[];

  @ManyToOne(() => PayrollByStore)
  @JoinColumn({ foreignKeyConstraintName: 'fk_payroll_by_store_id' })
  payrollByStore: PayrollByStore;
}
