import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export enum UNIQUE_COLUMN {
  EMPLOYEE_CONTACT = 'EMPLOYEE_CONTACT',
  EMPLOYEE_EMAIL = 'EMPLOYEE_EMAIL',
  EMPLOYEE_ACCOUNT_NO = 'EMPLOYEE_ACCOUNT_NO'
}

export class EmployeeUniquePagination {
  @ApiPropertyOptional({
    type: String,
    example: 'is email'
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    type: String,
    example: 'is phone number'
  })
  @IsOptional()
  @IsString()
  contact: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  accountNo: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsIn(Object.values(UNIQUE_COLUMN))
  type: UNIQUE_COLUMN;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isUpdate: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  employeeId: number;
}
