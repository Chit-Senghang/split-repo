import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { EmployeeContact } from '../../employee-contact/entities/employee-contact.entity';
import { EmployeeEducation } from '../../employee-education/entities/employee-education.entity';
import { EmployeeIdentifier } from '../../employee-identifier/entities/employee-identifier.entity';
import { EmployeeEmergencyContact } from '../../employee-emergency-contact/entities/employee-emergency-contact.entity';
import { EmployeeInsurance } from '../../employee-insurance/entities/employee-insurance.entity';
import { CodeValue } from '../../key-value/entity';
import { EmployeeSkill } from '../../employee-skill/entities/employee-skill.entity';
import { EmployeeLanguage } from '../../employee-language/entities/employee-language.entity';
import { EmployeeTraining } from '../../employee-training/entities/employee-training.entity';
import { WorkingShift } from '../../workshift-type/entities/working-shift.entity';
import { Geographic } from '../../geographic/entities/geographic.entity';
import { EmployeeVaccination } from '../../employee-vaccination/entities/employee-vaccination.entity';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { EmploymentStatusEnum } from '../enum/employment-status.enum';
import { ContractTypeEnum } from '../enum/contract-type.enum';
import { TaxResponsibleEnum } from '../enum/tax-responsible.enum';
import {
  EmployeeActiveStatusEnum,
  EmployeeStatusEnum,
  EmploymentTypeEnum
} from '../enum/employee-status.enum';
import { EmployeePaymentMethodAccount } from '../../employee-payment-method-account/entities/employee-payment-method-account.entity';
import { PayrollReport } from '../../payroll-generation/entities/payroll-report.entity';
import { LeaveStock } from '../../leave/leave-request/entities/leave-stock.entity';
import { LeaveRequest } from '../../leave/leave-request/entities/leave-request.entity';
import { DateTransformer } from '../../shared-resources/entity/date-value-transformer';
import { PayrollBenefitAdjustment } from '../../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';

export const employeeSearchableColumns = [
  'accountNo',
  'fingerPrintId',
  'firstNameEn',
  'lastNameEn',
  'lastNameKh',
  'firstNameKh',
  'displayFullNameKh',
  'displayFullNameEn',
  'email',
  'spouseOccupation'
];
@Entity()
export class Employee extends AuditBaseEntity {
  @Column({ type: 'varchar', length: 20 })
  accountNo: string;

  @Column()
  fingerPrintId: string;

  @Column({ type: 'varchar', length: 10 })
  employmentStatus: EmploymentStatusEnum;

  @Column()
  firstNameEn: string;

  @Column({ nullable: true })
  lastNameEn: string;

  @Column()
  lastNameKh: string;

  @Column()
  firstNameKh: string;

  @Column({ type: 'varchar' })
  displayFullNameKh: string;

  @Column({ type: 'varchar' })
  displayFullNameEn: string;

  @ManyToOne(() => CodeValue, (CodeValue) => CodeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_gender_id_code_value_id',
    name: 'gender_id'
  })
  gender: CodeValue;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  postProbationDate: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  resignDate: Date;

  @Column()
  contractType: ContractTypeEnum;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  contractPeriodStartDate: Date;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  contractPeriodEndDate: Date;

  @Column()
  employmentType: EmploymentTypeEnum;

  @ManyToOne(() => WorkingShift, (workingShift) => workingShift.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_working_shift_id_working_shift_id',
    name: 'working_shift_id'
  })
  workingShiftId: WorkingShift;

  @Column({
    type: 'timestamp',
    transformer: new DateTransformer()
  })
  dob: Date;

  @Column()
  age: number;

  @Column()
  userId: number;

  @ManyToOne(() => Geographic, (geographic) => geographic.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_place_of_birth_id_geographic_id',
    name: 'place_of_birth_id'
  })
  placeOfBirthId: Geographic;

  @ManyToOne(() => CodeValue, (CodeValue) => CodeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_nationality_key_value_id',
    name: 'nationality_id'
  })
  nationality: CodeValue;

  @Column()
  email: string;

  @ManyToOne(() => CodeValue, (CodeValue) => CodeValue.id)
  @JoinColumn({
    name: 'marital_status_id',
    foreignKeyConstraintName: 'fk_marial_status_id_code_value_id'
  })
  maritalStatus: CodeValue;

  @ManyToOne(() => CodeValue, (codeValue) => codeValue.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_spouse_code_value_id',
    name: 'spouse'
  })
  spouseId: CodeValue;

  @Column()
  spouseOccupation: string;

  @Column()
  numberOfChildren: number;

  @Column({ type: 'varchar', length: 20 })
  addressHomeNumber: string;

  @Column({ type: 'varchar', length: 20 })
  addressStreetNumber: string;

  @ManyToOne(() => Geographic, (geographic) => geographic.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_address_village_id_geographic_id',
    name: 'address_village_id'
  })
  addressVillageId: Geographic;

  @ManyToOne(() => Geographic, (geographic) => geographic.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_address_province_id_geographic_id',
    name: 'address_province_id'
  })
  addressProvinceId: Geographic;

  @ManyToOne(() => Geographic, (geographic) => geographic.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_address_district_id_geographic_id',
    name: 'address_district_id'
  })
  addressDistrictId: Geographic;

  @ManyToOne(() => Geographic, (geographic) => geographic.id)
  @JoinColumn({
    foreignKeyConstraintName: 'fk_address_commune_id_geographic_id',
    name: 'address_commune_id'
  })
  addressCommuneId: Geographic;

  @Column({ type: 'varchar', length: 20 })
  taxResponsible: TaxResponsibleEnum;

  @Column({ type: 'varchar', length: 20 })
  status: EmployeeStatusEnum | EmployeeActiveStatusEnum;

  @OneToMany(
    () => EmployeeContact,
    (employeeContact) => employeeContact.employee
  )
  contacts: EmployeeContact[];

  @OneToMany(
    () => EmployeeEducation,
    (employeeEducation) => employeeEducation.employeeId
  )
  educations: EmployeeEducation[];

  @OneToMany(
    () => EmployeeIdentifier,
    (employeeIdentifier) => employeeIdentifier.employeeId
  )
  identifiers: EmployeeIdentifier[];

  @OneToMany(
    () => EmployeePaymentMethodAccount,
    (employeePaymentMethodAccount) => employeePaymentMethodAccount.employee
  )
  paymentMethodAccounts: EmployeePaymentMethodAccount[];

  @OneToMany(
    () => EmployeeInsurance,
    (employeeInsurance) => employeeInsurance.employeeId
  )
  insuranceCards: EmployeeInsurance[];

  @OneToMany(
    () => EmployeeEmergencyContact,
    (employeeEmergencyContact) => employeeEmergencyContact.employeeId
  )
  emergencyContacts: EmployeeEmergencyContact[];

  @OneToMany(() => EmployeeSkill, (employeeSkill) => employeeSkill.employeeId)
  skills: EmployeeSkill[];

  @OneToMany(
    () => EmployeeLanguage,
    (employeeLanguage) => employeeLanguage.employeeId
  )
  languages: EmployeeLanguage[];

  @OneToMany(
    () => EmployeeTraining,
    (employeeTraining) => employeeTraining.employeeId
  )
  trainings: EmployeeTraining[];

  @OneToMany(
    () => EmployeeVaccination,
    (employeeVaccination) => employeeVaccination.employeeId
  )
  vaccinationCards: EmployeeVaccination[];

  @OneToMany(
    () => EmployeePosition,
    (employeePosition) => employeePosition.employee
  )
  positions: EmployeePosition[];

  @OneToMany(() => PayrollReport, (payrollReport) => payrollReport.employee)
  payrollReport: PayrollReport[];

  @OneToMany(() => LeaveStock, (leaveStock) => leaveStock.employee)
  leaveStock: LeaveStock[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequest: LeaveRequest[];

  @Column()
  attendanceAllowanceInProbation: boolean;

  @OneToMany(
    () => PayrollBenefitAdjustment,
    (payrollBenefitAdjustment) => payrollBenefitAdjustment.employee
  )
  payrollBenefitAdjustment: PayrollBenefitAdjustment[];

  @BeforeInsert()
  @BeforeUpdate()
  trimColumns(): void {
    this.accountNo = this.accountNo?.trim();
    this.fingerPrintId = this.fingerPrintId?.trim();
    this.firstNameEn = this.firstNameEn?.trim();
    this.lastNameEn = this.lastNameEn?.trim();
    this.lastNameKh = this.lastNameKh?.trim();
    this.firstNameKh = this.firstNameKh?.trim();
    this.displayFullNameKh = this.displayFullNameKh?.trim();
    this.displayFullNameEn = this.displayFullNameEn?.trim();
    this.spouseOccupation = this.spouseOccupation?.trim();
    this.addressHomeNumber = this.addressHomeNumber?.trim();
    this.addressStreetNumber = this.addressStreetNumber?.trim();
  }
}
