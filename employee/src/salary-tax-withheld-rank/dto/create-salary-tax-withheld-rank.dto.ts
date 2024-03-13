import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalaryTaxTypeEnum } from '../enums/salary-tax-type.enum';

export class CreateSalaryTaxWithheldRankDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @Min(0)
  fromAmount: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Min(0)
  toAmount: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @Min(0)
  taxRate: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @Min(0)
  deduction: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(Object.values(SalaryTaxTypeEnum))
  type: SalaryTaxTypeEnum;
}
