import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';

@Entity()
export class Seniority extends AuditBaseEntity {
  @OneToOne(() => Employee)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @Column({ type: 'timestamp', transformer: new DateTimeTransformer() })
  date: Date;

  @Column({ type: 'decimal' })
  total: number;

  @Column({ name: 'total_round', type: 'decimal' })
  totalRound: number;

  @Column({ name: 'taxable_amount_dollar', type: 'decimal' })
  taxableAmountDollar: number;

  @Column({ name: 'taxable_amount_dollar_round', type: 'decimal' })
  taxableAmountDollarRound: number;

  @Column({ name: 'exchange_rate', type: 'decimal' })
  exchangeRate: number;

  @Column({ name: 'average_total_salary', type: 'decimal' })
  averageTotalSalary: number;

  @Column({ name: 'prorate_per_day', type: 'decimal' })
  proratePerDay: number;

  @Column({ type: 'decimal', nullable: true })
  check: number;
}
