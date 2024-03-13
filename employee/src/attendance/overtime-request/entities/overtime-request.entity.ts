import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { Employee } from '../../../employee/entity/employee.entity';
import { DateTransformer } from '../../../shared-resources/entity/date-value-transformer';
import { OvertimeTypeEnum } from '../../../shared-resources/common/enums/overtime-type.enum';
import { ReasonTemplate } from '../../../reason-template/entities/reason-template.entity';
import { AttendanceReport } from '../../attendance-report/entities/attendance-report.entity';

export const overTimeRequestSearchableColumns = [
  'requestDate',
  'startTime',
  'endTime',
  'reason',
  'status'
];
@Entity()
export class OvertimeRequest extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @Column({
    type: 'date',
    transformer: new DateTransformer()
  })
  requestDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 10, default: StatusEnum.PENDING })
  status: string;

  @Column({ type: 'enum', enum: OvertimeTypeEnum })
  overtimeType: OvertimeTypeEnum;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;

  @ManyToMany(() => AttendanceReport)
  @JoinTable({
    name: 'attendance_report_overtime_request',
    joinColumn: { name: 'overtime_request_id' },
    inverseJoinColumn: { name: 'attendance_report_id' }
  })
  attendanceReports: AttendanceReport[];
}
