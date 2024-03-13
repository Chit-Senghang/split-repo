import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PayrollByStorePagination extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @IsOptional()
  @IsString()
  date: string;
}
