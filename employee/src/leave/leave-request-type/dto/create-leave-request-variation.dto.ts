import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import {
  LeavePolicyEmployeeStatusEnum,
  EmploymentTypeEnum
} from '../../../employee/enum/employee-status.enum';

export class CreateLeaveRequestVariationDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType: string;

  @IsOptional()
  @IsNumber()
  gender: number;

  @IsOptional()
  @IsEnum(LeavePolicyEmployeeStatusEnum)
  employeeStatus: string;

  @IsOptional()
  @IsNumber()
  proratePerMonth: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowancePerYear: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  benefitAllowanceDay: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  benefitAllowancePercentage: number;

  @IsOptional()
  @IsNumber()
  specialLeaveAllowanceDay: number;
}
