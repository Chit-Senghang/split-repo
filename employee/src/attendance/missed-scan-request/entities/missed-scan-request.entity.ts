import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../../employee/entity/employee.entity';
import {
  DateTimeTransformer,
  DateTransformer
} from '../../../shared-resources/entity/date-value-transformer';
import { ReasonTemplate } from '../../../reason-template/entities/reason-template.entity';

export const missedScanRequestSearchableColumns = [
  'startScanTimePartOne',
  'endScanTimePartOne',
  'endScanTimePartTwo',
  'requestDate',
  'reason',
  'status'
];
@Entity({ name: 'missed_scan_request' })
export class MissedScanRequest extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  requestDate: Date;

  @Column({ type: 'varchar' })
  reason: string;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  scanTime: Date;

  @Column()
  status: StatusEnum;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;
}
