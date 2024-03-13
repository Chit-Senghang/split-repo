import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PayrollReportPaginate extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  fromDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  toDate: string;
}
