import { Column, Entity, OneToMany } from 'typeorm';
import { LeaveRequest } from '../../leave-request/entities/leave-request.entity';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import {
  LeavePolicyEmployeeStatusEnum,
  EmploymentTypeEnum
} from '../../../employee/enum/employee-status.enum';

@Entity()
export class LeaveRequestType extends AuditBaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'varchar', length: 20 })
  policyEmploymentType: EmploymentTypeEnum;

  @Column({ type: 'simple-array' })
  policyGender: string[];

  @Column({ type: 'varchar', length: 20 })
  policyEmployeeStatus: LeavePolicyEmployeeStatusEnum;

  @Column({ type: 'decimal', default: 0 })
  policyProratedPerMonth: number;

  @Column({ type: 'decimal', default: 0 })
  policyAllowancePerYear: number;

  @Column({ type: 'decimal', default: 0 })
  policyIncrementRule: number;

  @Column({ type: 'decimal', default: 0 })
  policyIncrementAllowance: number;

  @Column({ type: 'varchar', length: 100 })
  policyCoverFrom: string;

  @Column({ type: 'decimal', default: 0 })
  policyRequireDoc: number;

  @Column({ type: 'decimal', default: 0 })
  policyAllowanceRule: number;

  @Column({ type: 'decimal', default: 0 })
  policyAllowance: number;

  @Column({ type: 'boolean' })
  policyCarryIsForward: boolean;

  @Column()
  policyCarryForward: number;

  @OneToMany(
    () => LeaveRequest,
    (leaveRequest) => leaveRequest.leaveTypeVariation
  )
  leaveRequest: LeaveRequest[];
}
