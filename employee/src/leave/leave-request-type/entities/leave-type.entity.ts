import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../../shared-resources/entity/audit-base.entity';
import { LeaveStock } from '../../leave-request/entities/leave-stock.entity';
import { LeaveTypeVariation } from './leave-type-variation.entity';

@Entity()
export class LeaveType extends AuditBaseEntity {
  @Column({ name: 'leave_type_name', length: 255, nullable: false })
  leaveTypeName: string;

  @Column({ name: 'leave_type_name_kh', length: 255, nullable: true })
  leaveTypeNameKh: string;

  @Column({ name: 'increment_rule', nullable: true })
  incrementRule: number;

  @Column({ name: 'increment_allowance', nullable: true })
  incrementAllowance: number;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.id)
  @JoinColumn({ name: 'cover_from' })
  coverFrom: LeaveType;

  @Column()
  requiredDoc: number;

  @Column({ name: 'carry_forward_status', default: false })
  carryForwardStatus: boolean;

  @Column({ name: 'carry_forward_allowance', nullable: true })
  carryForwardAllowance: number;

  @OneToMany(
    () => LeaveTypeVariation,
    (leaveTypeVariation) => leaveTypeVariation.leaveType
  )
  leaveTypeVariation: LeaveTypeVariation[];

  @Column()
  isPublicHoliday: boolean;

  @Column({ name: 'priority', nullable: true })
  priority: number;

  @OneToMany(() => LeaveStock, (leaveStock) => leaveStock.leaveType)
  leaveStock: LeaveStock[];
}
