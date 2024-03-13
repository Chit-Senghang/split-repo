import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Min,
  IsInt,
  IsNotEmpty,
  MaxLength,
  IsIn,
  ValidateNested,
  ArrayMinSize,
  Matches
} from 'class-validator';
import { CreateEmployeeContactDto } from '../../employee-contact/dto/create-employee-contact.dto';
import { CreateEmployeeEducationDto } from '../../employee-education/dto/create-employee-education.dto';
import { CreateEmployeeEmergencyContactDto } from '../../employee-emergency-contact/dto/create-employee-emergency-contact.dto';
import { CreateEmployeeIdentifierDto } from '../../employee-identifier/dto/create-employee-identifier.dto';
import { CreateEmployeeInsuranceDto } from '../../employee-insurance/dto/create-employee-insurance.dto';
import { CreateEmployeePositionImportDto } from '../../employee-position/dto/create-employee-position.dto';
import { CreateEmployeeVaccinationDto } from '../../employee-vaccination/dto/create-employee-vaccination.dto';
import { ContractTypeEnum } from '../enum/contract-type.enum';
import { EmploymentStatusEnum } from '../enum/employment-status.enum';
import { TaxResponsibleEnum } from '../enum/tax-responsible.enum';
import { CreateEmployeePaymentMethodAccountDto } from '../../employee-payment-method-account/dto/create-employee-payment-method-account.dto';
import { EmploymentTypeEnum } from '../enum/employee-status.enum';

export class CreateEmployeeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @IsString()
  @IsNotEmpty() // eslint-disable-next-line no-useless-escape
  @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/, {
    message: 'Space are not allowed.'
  })
  @MaxLength(20)
  accountNo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  fingerPrintId: string;

  @IsNotEmpty()
  @IsIn(Object.keys(EmploymentStatusEnum))
  employmentStatus: EmploymentStatusEnum;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstNameEn: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  lastNameEn: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  firstNameKh: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  lastNameKh: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  genderId: number;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsOptional()
  @IsString()
  postProbationDate: string;

  @IsOptional()
  @IsString()
  resignDate?: string;

  @IsNotEmpty()
  @IsIn(Object.keys(ContractTypeEnum))
  contractType: ContractTypeEnum;

  @IsOptional()
  @IsString()
  contractPeriodStartDate: string;

  @IsOptional()
  @IsString()
  contractPeriodEndDate: string;

  @IsNotEmpty()
  @IsIn(Object.keys(EmploymentTypeEnum))
  employmentType: EmploymentTypeEnum;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  workingShiftId: number;

  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  age?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  placeOfBirthId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  nationality: number;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  maritalStatusId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  spouseId: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  spouseOccupation: string;

  @IsOptional()
  @IsInt()
  numberOfChildren: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  addressHomeNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  addressStreetNumber: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  addressVillageId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  addressProvinceId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  addressDistrictId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  addressCommuneId: number;

  @IsOptional()
  @IsIn(Object.values(TaxResponsibleEnum))
  taxResponsible: TaxResponsibleEnum;

  @IsNotEmpty()
  @ValidateNested()
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateEmployeeContactDto)
  contacts: CreateEmployeeContactDto[];

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => CreateEmployeeEmergencyContactDto)
  emergencyContacts: CreateEmployeeEmergencyContactDto[];

  @ValidateNested()
  @IsOptional()
  @IsArray()
  @Type(() => CreateEmployeeIdentifierDto)
  identifiers: CreateEmployeeIdentifierDto[];

  @ValidateNested()
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateEmployeePaymentMethodAccountDto)
  paymentMethodAccounts: CreateEmployeePaymentMethodAccountDto[];

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => CreateEmployeeInsuranceDto)
  insuranceCards: CreateEmployeeInsuranceDto[];

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => CreateEmployeeVaccinationDto)
  vaccinationCards: CreateEmployeeVaccinationDto[];

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => CreateEmployeeEducationDto)
  educations: CreateEmployeeEducationDto[];

  @IsNotEmpty()
  @ValidateNested()
  @IsArray()
  @Type(() => CreateEmployeePositionImportDto)
  positions: CreateEmployeePositionImportDto[];

  @IsOptional()
  @IsArray()
  languages: number[];

  @IsOptional()
  @IsArray()
  trainings: number[];

  @IsOptional()
  @IsArray()
  skills: number[];

  @IsOptional()
  @IsArray()
  documentIds?: number[];
}

export class CodeValueDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  codeValueId?: number;
}
