import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { WorkShiftTypeEnum } from '../../workshift-type/common/ts/enum/workshift-type.enum';
import {
  EmploymentTypeEnum,
  EmployeeStatusEnum
} from '../enum/employee-status.enum';
import { BasePaginationQueryWithAuditDto } from '../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class EmployeeMasterInformationPagination extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional({
    example: 'sort WorkingShiftType (workingShiftTypeId)'
  })
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional({
    example:
      'contacts,emergencyContacts,identifiers,paymentMethodAccounts,positions,vaccinationCards,insuranceCards,educations,languages,trainings,skills'
  })
  @IsOptional()
  includes: string;

  @ApiPropertyOptional()
  @IsOptional()
  isMoved: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(WorkShiftTypeEnum)
  workShiftType: WorkShiftTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType: EmploymentTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  workshiftId: number;

  @ApiPropertyOptional()
  @IsOptional()
  genderId: number;

  @ApiPropertyOptional()
  @IsOptional()
  workshiftTypeId: number;

  @ApiPropertyOptional({
    type: Number,
    example: 'levelNumberId'
  })
  @IsOptional()
  levelNumberId: number;

  @ApiPropertyOptional({
    type: String,
    default: EmployeeStatusEnum.ACTIVE
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EmployeeStatusEnum))
  status: EmployeeStatusEnum;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  accountNo: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  firstNameEn: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  firstNameKh: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  lastNameEn: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  lastNameKh: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  displayFullNameKh: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  displayFullNameEn: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  displayName: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  contactNumber: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  newEmployeeInMonth: string;
}
