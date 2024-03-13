import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { Employee } from '../../employee/entity/employee.entity';
import { PayrollDeductionType } from '../../payroll-deduction-type/entities/payroll-deduction-type.entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class PayrollDeduction extends AuditBaseEntity {
  @Column({ type: 'timestamp', transformer: new DateTransformer() })
  deductionDate: Date;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column()
  status: StatusEnum;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({ foreignKeyConstraintName: 'fk_employee_id_employee_id' })
  employee: Employee;

  @ManyToOne(
    () => PayrollDeductionType,
    (payrollDeductionType) => payrollDeductionType.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_payroll_deduction_type_id_payroll_deduction_type_id'
  })
  payrollDeductionType: PayrollDeductionType;
}
