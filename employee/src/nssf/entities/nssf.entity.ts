import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from '../../employee/entity/employee.entity';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';

@Entity({ name: 'employee_nssf' })
export class Nssf extends AuditBaseEntity {
  @Column({ name: 'nssf_id' })
  nssfId: string;

  @Column({ name: 'salary', type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({
    name: 'salary_in_average',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  salaryInAverage: number;

  @Column({ name: 'salary_with_tax', type: 'decimal', precision: 10, scale: 2 })
  salaryWithTax: number;

  @Column({
    name: 'nssf_personal_accident_insurance',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  nssfPersonalAccidentInsurance: number;

  @Column({
    name: 'nssf_health_insurance',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  nssfHealthInsurance: number;

  @Column({
    name: 'pension_fund_employee',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  pensionFundEmployee: number;

  @Column({
    name: 'pension_fund_company',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  pensionFundCompany: number;

  @Column({ type: 'timestamp', transformer: new DateTransformer() })
  date: Date;

  @Column({ name: 'total_nssf_paid', type: 'decimal', precision: 10, scale: 2 })
  totalNSSFPaid: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
