import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';

@Entity()
export class EmployeeTraining extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.trainings)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.employeeTraining)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_training_id_code_value_id',
    name: 'training_id'
  })
  trainingId: CodeValue;
}
