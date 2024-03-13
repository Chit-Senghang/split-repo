import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CodeValue } from '../../key-value/entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';
import { ReasonTemplate } from '../../reason-template/entities/reason-template.entity';
import { EmployeeWarningStatusEnum } from '../common/ts/enum/status.enum';

@Entity()
export class EmployeeWarning extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_warning_type_id_code_value_id',
    name: 'warning_type_id'
  })
  warningTypeId: CodeValue;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'timestamp', transformer: new DateTransformer() })
  warningDate: Date;

  @Column()
  status: EmployeeWarningStatusEnum;

  @Column()
  count: number;

  @Column({ type: 'varchar' })
  warningTitle: string;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;
}
