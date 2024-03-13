import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength
} from 'class-validator';
import { EmploymentTypeEnum } from '../../employee/enum/employee-status.enum';

export class CreateEmployeeMovementDto {
  @IsNotEmpty()
  @Min(1)
  employeeId: number;

  @IsOptional()
  @Min(1)
  @IsInt()
  requestMovementEmployeePositionId: number;

  @IsOptional()
  @Min(1)
  @IsInt()
  previousCompanyStructurePositionId: number;

  @IsOptional()
  @Min(1)
  @IsInt()
  newCompanyStructurePositionId: number;

  @IsString()
  @IsNotEmpty()
  effectiveDate: string;

  @IsOptional()
  @IsArray()
  documentIds: number[];

  @ApiProperty({
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  reason: string;

  @ApiProperty({
    type: Number,
    required: true
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  reasonTemplateId: number;

  @MaxLength(10)
  @MinLength(1)
  @IsString()
  @IsOptional()
  @IsIn(Object.values(EmploymentTypeEnum))
  newEmploymentType: EmploymentTypeEnum;

  @IsOptional()
  @Min(1)
  @IsInt()
  newWorkingShiftId: number;
}
