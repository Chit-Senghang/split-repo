import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationSeniorityDto extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId: number;
}
