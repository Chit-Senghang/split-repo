import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from '../../../../../employee/src/employee/entity/employee.entity';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { LeaveType } from '../../leave-request-type/entities/leave-type.entity';

@Entity()
export class LeaveStock extends AuditBaseEntity {
  @ManyToOne(() => Employee)
  @JoinColumn({ foreignKeyConstraintName: 'fk_employee_id' })
  employee: Employee;

  @ManyToOne(() => LeaveType)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_leave_type',
    name: 'leave_type_id'
  })
  leaveType: LeaveType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  leaveDay: number;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  carryForward: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  carryForwardRemaining: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  actualCarryForward: number;

  @Column({ type: 'date' })
  carryForwardExpiryDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyIncrementRule: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyIncrementAllowance: number;

  @Column()
  policyCarryForwardStatus: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyCarryForwardAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyProratePerMonth: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyAllowancePerYear: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyBenefitAllowanceDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policyBenefitAllowancePercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  policySpecialLeaveAllowanceDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  specialLeaveAllowanceDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  leaveDayTopUp: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  leaveDayTopUpRemaining: number;
}
