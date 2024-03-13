import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';

export const employeeIdentificationSearchableColumns = ['expireDate'];
@Entity()
export class EmployeeIdentifier extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.identifiers)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.employeeIdentifier)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_document_type_id_code_value_id',
    name: 'document_type_id'
  })
  documentTypeId: CodeValue;

  @Column()
  documentIdentifier: string;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  expireDate: Date;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
