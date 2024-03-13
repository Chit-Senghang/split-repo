import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';

@Entity()
export class EmployeeEducation extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.educations)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employeeId: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.employeeEducation)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_education_type_id_code_value_id',
    name: 'education_type_id'
  })
  educationTypeId: CodeValue;

  @Column({ type: 'varchar', length: 255 })
  instituteName: string;

  @Column({ type: 'varchar', length: 255 })
  major: string;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  endDate: Date;
}
