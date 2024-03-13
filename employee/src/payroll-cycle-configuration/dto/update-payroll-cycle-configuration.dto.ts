import { IsIn, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollCycleConfigurationMonthEnum } from '../enums/payroll-cycle-configuration.enum';

export class UpdatePayrollCycleConfigurationDto {
  @Min(1)
  @Max(31)
  @IsNotEmpty()
  @ApiProperty()
  firstCycleFromDate: number;

  @Min(1)
  @Max(31)
  @IsNotEmpty()
  @ApiProperty()
  firstCycleToDate: number;

  @IsNotEmpty()
  @ApiProperty()
  @IsIn(Object.values(PayrollCycleConfigurationMonthEnum))
  firstCycleFromMonth: PayrollCycleConfigurationMonthEnum;

  @IsNotEmpty()
  @ApiProperty()
  @IsIn(Object.values(PayrollCycleConfigurationMonthEnum))
  firstCycleToMonth: PayrollCycleConfigurationMonthEnum;

  @Min(1)
  @Max(31)
  @IsOptional()
  @ApiPropertyOptional()
  secondCycleFromDate: number;

  @Min(1)
  @Max(31)
  @IsOptional()
  @ApiPropertyOptional()
  secondCycleToDate: number;

  @IsOptional()
  @ApiPropertyOptional()
  @IsIn(Object.values(PayrollCycleConfigurationMonthEnum))
  secondCycleFromMonth: PayrollCycleConfigurationMonthEnum;

  @IsOptional()
  @ApiPropertyOptional()
  @IsIn(Object.values(PayrollCycleConfigurationMonthEnum))
  secondCycleToMonth: PayrollCycleConfigurationMonthEnum;
}
