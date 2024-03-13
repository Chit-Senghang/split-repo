import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../shared-resources/common/dto/base-pagination-query.dto';

export class LeaveStockPagination extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  month: number;

  @ApiPropertyOptional()
  @IsOptional()
  locationId?: number;

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
}
