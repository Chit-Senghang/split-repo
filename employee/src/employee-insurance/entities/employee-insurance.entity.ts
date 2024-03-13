import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { Insurance } from '../../insurance/entities/insurance.entity';

@Entity()
export class EmployeeInsurance extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  cardNumber: string;

  @ManyToOne(() => Employee, (employee) => employee.insuranceCards)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => Insurance, (insurance) => insurance.employeeInsurance)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_insurance_id_insurance_id',
    name: 'insurance_id'
  })
  insuranceId: Insurance;
}
