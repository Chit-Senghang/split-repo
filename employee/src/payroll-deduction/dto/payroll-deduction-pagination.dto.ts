import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';

export class PayrollDeductionPagination extends OmitType(
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
  payrollDeductionTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(StatusEnum))
  status: StatusEnum;
}
