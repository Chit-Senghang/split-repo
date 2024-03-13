import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne
} from 'typeorm';
import { MissionRequest } from '../../../leave/mission-request/entities/mission-request.entity';
import { DayOffRequest } from '../../../leave/day-off-request/entities/day-off-request.entity';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../../employee/entity/employee.entity';
import { LeaveRequest } from '../../../leave/leave-request/entities/leave-request.entity';
import { DateTimeTransformer } from '../../../shared-resources/entity/date-value-transformer';
import { OvertimeRequest } from '../../overtime-request/entities/overtime-request.entity';
import { AttendanceReportStatusEnum } from '../enum/attendance-report-status.enum';

@Entity()
export class AttendanceReport extends AuditBaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @Column({ type: 'enum', enum: [2, 4] })
  scanType: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  checkIn: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  breakIn: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  breakOut: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  checkOut: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lateCheckIn: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  breakInEarly: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lateBreakOut: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  checkOutEarly: number;

  @Column({ length: 50, nullable: true })
  workingHour?: string;

  @Column({ length: 50, nullable: true })
  otDuration?: string;

  @Column({
    type: 'enum',
    enum: AttendanceReportStatusEnum,
    default: 'Absent'
  })
  status: AttendanceReportStatusEnum;

  @ManyToMany(() => OvertimeRequest, { cascade: true })
  @JoinTable({
    name: 'attendance_report_overtime_request',
    joinColumn: { name: 'attendance_report_id' },
    inverseJoinColumn: { name: 'overtime_request_id' }
  })
  overtimeRequests: OvertimeRequest[];

  @ManyToMany(() => MissionRequest, { cascade: true })
  @JoinTable({
    name: 'attendance_report_mission_request',
    joinColumn: { name: 'attendance_report_id' },
    inverseJoinColumn: { name: 'mission_request_id' }
  })
  missionRequests: MissionRequest[];

  @ManyToMany(() => LeaveRequest, { cascade: true })
  @JoinTable({
    name: 'attendance_report_leave_request',
    joinColumn: { name: 'attendance_report_id' },
    inverseJoinColumn: { name: 'leave_request_id' }
  })
  leaveRequests: LeaveRequest[];

  @OneToOne(() => DayOffRequest, (dayOffRequest) => dayOffRequest)
  @JoinColumn({
    name: 'day_off_id',
    foreignKeyConstraintName: 'fk_day_off_id'
  })
  dayOffRequest: DayOffRequest;
}
