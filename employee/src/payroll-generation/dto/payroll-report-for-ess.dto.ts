import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { AUDIT_BASE_ORDERBY_OPTIONS } from '../../shared-resources/ts/constants/audit-base-orderby.constants';

export class PayrollReportForEssUserPagination extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([...AUDIT_BASE_ORDERBY_OPTIONS, 'date'])
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  month: number;

  @ApiPropertyOptional()
  @IsOptional()
  year: number;
}
