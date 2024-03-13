import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from 'typeorm';
import { AttendanceReport } from '../../../attendance/attendance-report/entities/attendance-report.entity';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../../employee/entity/employee.entity';
import { ReasonTemplate } from '../../../reason-template/entities/reason-template.entity';
import { LeaveRequestDurationTypeEnEnum } from '../enums/leave-request-duration-type.enum';
import { LeaveTypeVariation } from '../../leave-request-type/entities/leave-type-variation.entity';

export const leaveRequestSearchableColumns = ['reason', 'status'];
@Entity()
export class LeaveRequest extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  employee: Employee;

  @Column({ type: 'varchar' })
  durationType: LeaveRequestDurationTypeEnEnum;

  @Column({ type: 'date' })
  fromDate: Date | string;

  @Column({ type: 'date' })
  toDate: Date | string;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column()
  status: string;

  @Column()
  isSpecialLeave: boolean;

  @ManyToOne(() => LeaveTypeVariation, (leaveType) => leaveType.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_leave_type_variation_id',
    name: 'leave_type_id'
  })
  leaveTypeVariation: LeaveTypeVariation;

  @Column({ type: 'decimal', precision: 2 })
  leaveDuration: number;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;

  @ManyToMany(() => AttendanceReport)
  @JoinTable({
    name: 'attendance_report_leave_request',
    joinColumn: { name: 'leave_request_id' },
    inverseJoinColumn: { name: 'attendance_report_id' }
  })
  attendanceReports: AttendanceReport[];
}
