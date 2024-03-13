import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from 'typeorm';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../../employee/entity/employee.entity';
import { DateTimeTransformer } from '../../../shared-resources/entity/date-value-transformer';
import { ReasonTemplate } from '../../../reason-template/entities/reason-template.entity';
import { MissionRequestDurationTypeEnEnum } from '../enum/mission-request-duration-type.enum';
import { AttendanceReport } from '../../../attendance/attendance-report/entities/attendance-report.entity';

export const missionRequestSearchableColumns = [
  'status',
  'reason',
  'durationType'
];
@Entity({ name: 'mission_request' })
export class MissionRequest extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  employee: Employee;

  @Column({ type: 'varchar' })
  durationType: MissionRequestDurationTypeEnEnum;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  fromDate: string | Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  toDate: string | Date;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', default: StatusEnum.PENDING })
  status: StatusEnum;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;

  @ManyToMany(() => AttendanceReport)
  @JoinTable({
    name: 'attendance_report_mission_request',
    joinColumn: { name: 'mission_request_id' },
    inverseJoinColumn: { name: 'attendance_report_id' }
  })
  attendanceReports: AttendanceReport[];
}
