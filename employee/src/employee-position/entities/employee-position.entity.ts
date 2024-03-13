import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne
} from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { CompanyStructure } from '../../company-structure/entities/company-structure.entity';
import { EmployeeMovement } from '../../employee-movement/entities/employee-movement.entity';

@Entity()
export class EmployeePosition extends AuditBaseEntity {
  @Column()
  mpath: string;

  @OneToOne(() => Employee, (employee) => employee.positions)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_employee_id_employee_id',
    name: 'employee_id'
  })
  employee: Employee;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructureLocation) => companyStructureLocation.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_location_id_company_structure_id',
    name: 'company_structure_location_id'
  })
  companyStructureLocation: CompanyStructure;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructureCompany) => companyStructureCompany.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_company_id_company_structure_id',
    name: 'company_structure_company_id'
  })
  companyStructureCompany: CompanyStructure;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructureOutlet) => companyStructureOutlet.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_outlet_id_company_structure_id',
    name: 'company_structure_outlet_id'
  })
  companyStructureOutlet: CompanyStructure;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructureDepartment) => companyStructureDepartment.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_department_id_company_structure_id',
    name: 'company_structure_department_id'
  })
  companyStructureDepartment: CompanyStructure;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructureTeam) => companyStructureTeam.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_team_id_company_structure_id',
    name: 'company_structure_team_id'
  })
  companyStructureTeam: CompanyStructure;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructurePosition) => companyStructurePosition.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_position_id_company_structure_id',
    name: 'company_structure_position_id'
  })
  companyStructurePosition: CompanyStructure;

  @Column({
    type: 'boolean',
    default: true
  })
  isDefaultPosition: boolean;

  @OneToMany(
    () => EmployeeMovement,
    (employeeMovement) => employeeMovement.requestMovementEmployeePosition
  )
  employeeMovements: EmployeeMovement[];

  @Column({ type: 'boolean', default: false })
  isMoved: boolean;

  @Column()
  toEmployeePositionId: number;
}
