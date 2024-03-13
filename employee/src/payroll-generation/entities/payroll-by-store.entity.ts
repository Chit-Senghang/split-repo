import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';
import { CompanyStructure } from '../../company-structure/entities/company-structure.entity';
import { RoundTransform } from '../../shared-resources/entity/round-number';
import { PayrollMaster } from './payroll-master.entity';
import { PayrollReport } from './payroll-report.entity';

@Entity({ name: 'payroll_by_store' })
export class PayrollByStore extends AuditBaseEntity {
  @ManyToOne(() => PayrollMaster)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_payroll_master_id',
    name: 'payroll_master_id'
  })
  payrollMaster: PayrollMaster;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new RoundTransform()
  })
  total: number;

  @OneToMany(() => PayrollReport, (payroll) => payroll.payrollByStore)
  payrollReport: PayrollReport[];

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  date: Date;

  @ManyToOne(() => CompanyStructure)
  @JoinColumn({ foreignKeyConstraintName: 'fk_store_id' })
  store: CompanyStructure;
}
