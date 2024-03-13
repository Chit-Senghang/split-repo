import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { Vaccination } from '../../vaccination/entities/vaccination.entity';

@Entity()
export class EmployeeVaccination extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => Vaccination, (vaccination) => vaccination.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_vaccination_id_vaccination_id',
    name: 'vaccination_id'
  })
  vaccinationId: Vaccination;

  @Column({ type: 'varchar', length: 100 })
  cardNumber: string;
}
