import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne
} from 'typeorm';
import { PositionLevel } from '../../position-level/entities/position-level.entity';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { CompanyStructureComponent } from '../company-structure-component/entities/company-structure-component.entity';
import { EmployeeMovement } from '../../employee-movement/entities/employee-movement.entity';
import { FingerprintDevice } from '../../finger-print-device/entities/finger-print-device.entity';
import { BenefitIncreasementPolicy } from '../../benefit-increasement-policy/entities/benefit-increasement-policy.entity';
import { DateTimeTransformer } from '../../shared-resources/entity/date-value-transformer';

export const companyStructureSearchableColumns = [
  'description',
  'address',
  'companyStructureComponent.name'
];
@Entity()
export class CompanyStructure extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 1000 })
  address: string;

  @Column({
    type: 'timestamp',
    transformer: new DateTimeTransformer()
  })
  lastRetrieveDate: Date;

  @Column({ default: false })
  isHq: boolean;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructure) => companyStructure.children
  )
  @JoinColumn({
    foreignKeyConstraintName: 'fk_parent_id_company_structure_id',
    name: 'parent_id'
  })
  parentId: CompanyStructure;

  @ManyToOne(
    () => BenefitIncreasementPolicy,
    (postProbationBenefitIncreasementPolicy) =>
      postProbationBenefitIncreasementPolicy.id
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_post_probation_benefit_increasement_policy_id',
    name: 'post_probation_benefit_increasement_policy_id'
  })
  postProbationBenefitIncrementPolicy: BenefitIncreasementPolicy;

  @Column()
  structureType: string;

  @OneToMany(
    () => CompanyStructure,
    (companyStructure) => companyStructure.parentId
  )
  children: CompanyStructure[];

  @OneToOne(() => PositionLevel, (position) => position.companyStructure)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_company_structure_position_level_id',
    name: 'position_level_id'
  })
  positionLevelId: PositionLevel;

  @ManyToOne(
    () => CompanyStructureComponent,
    (structure) => structure.companyStructure
  )
  @JoinColumn({
    foreignKeyConstraintName: 'fk_company_structure_component_id',
    name: 'company_structure_component_id'
  })
  companyStructureComponent: CompanyStructureComponent;

  @OneToMany(
    () => EmployeePosition,
    (employeePosition) => employeePosition.companyStructurePosition
  )
  employeePosition: EmployeePosition[];

  @OneToMany(
    () => EmployeeMovement,
    (employeeMovement) => employeeMovement.previousCompanyStructurePosition
  )
  employeeMovements: EmployeeMovement[];

  @OneToOne(
    () => FingerprintDevice,
    (fingerprintDevice) => fingerprintDevice.companyStructure
  )
  @JoinColumn({
    foreignKeyConstraintName: 'fk_company_structure_fingerprint_device_id',
    name: 'fingerprint_device_id'
  })
  fingerprintDevice: FingerprintDevice;
}
