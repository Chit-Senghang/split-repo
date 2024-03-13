import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from '../../employee/entity/employee.entity';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';

@Entity()
export class EmployeeWorkingSchedule extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @Column({ type: 'date' })
  scheduleDate: Date;

  @Column({ type: 'time' })
  startWorkingTime: Date;

  @Column({ type: 'time' })
  endWorkingTime: Date;
}
