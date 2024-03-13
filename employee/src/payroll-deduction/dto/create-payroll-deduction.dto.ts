import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';

export class CreatePayrollDeductionDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  deductionDate: Date;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  payrollDeductionTypeId: number;

  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
