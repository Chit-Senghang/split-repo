import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';
import { EmployeeResignationStatusEnum } from '../common/ts/enums/employee-resignation-status.enum';
import { ReasonTemplate } from '../../reason-template/entities/reason-template.entity';

export const employeeResignationSearchableColumns = ['reason', 'status'];
@Entity()
export class EmployeeResignation extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_resign_type_id_code_value_id',
    name: 'resign_type_id'
  })
  resignTypeId: CodeValue;

  @Column({
    type: 'date',
    transformer: new DateTransformer()
  })
  resignDate: Date;

  @Column()
  reason: string;

  @Column({ type: 'varchar', length: 20 })
  status: EmployeeResignationStatusEnum;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;
}
