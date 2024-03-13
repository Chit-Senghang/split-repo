import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';

@Entity()
export class EmployeeLanguage extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_language_id_code_value_id',
    name: 'language_id'
  })
  languageId: CodeValue;
}
