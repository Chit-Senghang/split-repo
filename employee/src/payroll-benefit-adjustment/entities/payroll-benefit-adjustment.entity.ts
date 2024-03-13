import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { BenefitAdjustmentType } from '../../benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { EmployeeMovement } from '../../employee-movement/entities/employee-movement.entity';
import { PayrollBenefitAdjustmentDetail } from './payroll-benefit-adjustment-detail.entity';

@Entity()
export class PayrollBenefitAdjustment extends AuditBaseEntity {
  @ManyToOne(() => BenefitAdjustmentType)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_adjustment_type_id',
    name: 'adjustment_type_id'
  })
  adjustmentType: BenefitAdjustmentType;

  @Column({ length: 255 })
  reason: string;

  @Column({ type: 'varchar' })
  status: string;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @OneToMany(
    () => PayrollBenefitAdjustmentDetail,
    (payrollBenefitAdjustmentDetail) =>
      payrollBenefitAdjustmentDetail.payrollBenefitAdjustment
  )
  payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail[];

  @ManyToOne(() => EmployeeMovement, (employeeMovement) => employeeMovement.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_movement_id_employee_movement_id',
    name: 'employee_movement_id'
  })
  employeeMovement: EmployeeMovement;
}
