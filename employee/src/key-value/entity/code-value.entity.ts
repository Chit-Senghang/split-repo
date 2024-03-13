import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EmployeeEducation } from '../../employee-education/entities/employee-education.entity';
import { EmployeeIdentifier } from '../../employee-identifier/entities/employee-identifier.entity';
import { EmployeeEmergencyContact } from '../../employee-emergency-contact/entities/employee-emergency-contact.entity';
import { EmployeeSkill } from '../../employee-skill/entities/employee-skill.entity';
import { EmployeeLanguage } from '../../employee-language/entities/employee-language.entity';
import { EmployeeTraining } from '../../employee-training/entities/employee-training.entity';
import { Code } from './code.entity';

export const codeValueSearchableColumns = ['value'];
@Entity()
export class CodeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @Column()
  @Unique('uk_code_value_code', ['value'])
  value: string;

  @Column()
  isEnabled: boolean;

  @ManyToOne(() => Code, (Code) => Code.codeValue)
  @JoinColumn({ foreignKeyConstraintName: 'fk_key_id_key_id', name: 'code_id' })
  codeId: Code;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.children)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_parent_id_code_value_id',
    name: 'parent_id'
  })
  parentId: CodeValue;

  @OneToMany(() => CodeValue, (codeValue) => codeValue.parentId)
  children: CodeValue[];

  @ManyToOne(() => Code, (Code) => Code.codeValue)
  @JoinColumn({ foreignKeyConstraintName: 'fk_key_id_key_id' })
  code: Code;

  @Column({ nullable: true })
  identifier: string;

  @Column({ default: false })
  isSystemDefined: boolean;

  @OneToMany(
    () => EmployeeEducation,
    (employeeEducation) => employeeEducation.educationTypeId
  )
  employeeEducation: EmployeeEducation[];

  @OneToMany(
    () => EmployeeIdentifier,
    (employeeIdentifier) => employeeIdentifier.documentTypeId
  )
  employeeIdentifier: EmployeeIdentifier[];

  @OneToMany(
    () => EmployeeEmergencyContact,
    (employeeEmergencyContact) => employeeEmergencyContact.contactRelationship
  )
  employeeEmergencyContact: EmployeeEmergencyContact[];

  @OneToMany(() => EmployeeSkill, (employeeSkill) => employeeSkill.skillId)
  employeeSkill: EmployeeSkill[];

  @OneToMany(
    () => EmployeeLanguage,
    (employeeLanguage) => employeeLanguage.languageId
  )
  employeeLanguage: EmployeeLanguage[];

  @OneToMany(
    () => EmployeeTraining,
    (employeeTraining) => employeeTraining.trainingId
  )
  employeeTraining: EmployeeTraining[];

  @Column()
  valueInKhmer: string;
}
