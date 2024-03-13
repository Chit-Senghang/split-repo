import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationPayrollBenefitDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  payrollBenefitMasterId: number;

  @ApiPropertyOptional()
  @IsOptional()
  locationId: number;

  @ApiPropertyOptional()
  @IsOptional()
  outletId: number;

  @ApiPropertyOptional()
  @IsOptional()
  departmentId: number;

  @ApiPropertyOptional()
  @IsOptional()
  teamId: number;

  @ApiPropertyOptional()
  @IsOptional()
  positionId: number;

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: Date;
}
