import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';

@Entity()
export class EmployeeContact extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.contacts)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @Column({ type: 'varchar', length: 20 })
  contact: string;

  @Column()
  isDefault: boolean;

  @Column({ type: 'varchar', length: 4 })
  countryCode: string;
}
