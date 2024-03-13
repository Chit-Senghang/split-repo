import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';

export const employeeEmergencySearchableColumns = ['contact'];
@Entity()
export class EmployeeEmergencyContact extends AuditBaseEntity {
  @Column()
  contact: string;

  @ManyToOne(() => Employee, (employee) => employee.emergencyContacts)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_contact_relationship_id_code_value_id',
    name: 'contact_relationship_id'
  })
  contactRelationship: CodeValue;
}
