import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { CompanyStructure } from '../../company-structure/entities/company-structure.entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';
import { EmployeeMovementStatusEnum } from '../ts/enums/movement-status.enum';
import { ReasonTemplate } from '../../reason-template/entities/reason-template.entity';
import { WorkingShift } from '../../workshift-type/entities/working-shift.entity';
import { WorkshiftType } from '../../workshift-type/entities/workshift-type.entity';

export const employeeMovementSearchableColumns = ['reason', 'status'];
@Entity()
export class EmployeeMovement extends AuditBaseEntity {
  @ManyToOne(() => Employee, (Employee) => Employee.id)
  @JoinColumn({ foreignKeyConstraintName: 'fk_employee_id_employee_id' })
  employee: Employee;

  @ManyToOne(
    () => EmployeePosition,
    (employeePosition) => employeePosition.employeeMovements
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_request_movement_employee_position_id_employee_position_id',
    name: 'request_movement_employee_position_id'
  })
  requestMovementEmployeePosition: EmployeePosition;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructure) => companyStructure.employeeMovements
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_previous_company_structure_position_id_company_structure_id',
    name: 'previous_company_structure_position_id'
  })
  previousCompanyStructurePosition: CompanyStructure;

  @ManyToOne(() => CompanyStructure, (workShift) => workShift.employeeMovements)
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_new_company_structure_position_id_company_structure_id',
    name: 'new_company_structure_position_id'
  })
  newCompanyStructurePosition: CompanyStructure;

  @Column()
  reason: string;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  effectiveDate: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  lastMovementDate: Date;

  @Column()
  status: EmployeeMovementStatusEnum;

  @ManyToOne(() => ReasonTemplate, (reasonTemplate) => reasonTemplate.id)
  @JoinColumn({
    name: 'reason_template_id',
    foreignKeyConstraintName: 'fk_reason_template_id_reason_template'
  })
  reasonTemplate: ReasonTemplate;

  @Column()
  newEmploymentType: string;

  @Column()
  previousEmploymentType: string;

  @ManyToOne(() => WorkingShift, (workingShift) => workingShift.id)
  @JoinColumn({
    name: 'new_working_shift_id',
    foreignKeyConstraintName: 'fk_new_working_shift_id_working_shift_id'
  })
  newWorkingShiftId: WorkshiftType;

  @ManyToOne(() => WorkingShift, (workingShift) => workingShift.id)
  @JoinColumn({
    name: 'previous_working_shift_id',
    foreignKeyConstraintName: 'fk_previous_working_shift_id_working_shift_id'
  })
  previousWorkingShiftId: WorkshiftType;
}
