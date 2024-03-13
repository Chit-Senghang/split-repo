import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { CodeValue } from '../../../../../employee/src/key-value/entity';
import { LeaveType } from './leave-type.entity';

@Entity()
export class LeaveTypeVariation extends AuditBaseEntity {
  @ManyToOne(() => LeaveType)
  @JoinColumn({
    name: 'leave_type_id',
    foreignKeyConstraintName: 'fk_leave_type_id'
  })
  leaveType: LeaveType;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.id)
  @JoinColumn({
    name: 'gender_id',
    foreignKeyConstraintName: 'fk_code_value_id'
  })
  genderId: CodeValue;

  @Column({ name: 'employment_type' })
  employmentType: string;

  @Column({ name: 'employee_status' })
  employeeStatus: string;

  @Column({ type: 'real', name: 'prorate_per_month' })
  proratePerMonth: number;

  @Column({ type: 'real', name: 'allowance_per_year' })
  allowancePerYear: number;

  @Column({ type: 'real', default: 0 })
  benefitAllowanceDay: number;

  @Column({ type: 'real', default: 0 })
  benefitAllowancePercentage: number;

  @Column({ type: 'real', default: 0 })
  specialLeaveAllowanceDay: number;
}
