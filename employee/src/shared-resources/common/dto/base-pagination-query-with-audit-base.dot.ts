import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from './base-pagination-query.dto';

export class BasePaginationQueryWithAuditDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  createdFromDate: string;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  createdToDate: string;

  @ApiPropertyOptional({
    type: Number
  })
  @IsOptional()
  createdByUserId: number;

  @ApiPropertyOptional({
    type: Number
  })
  @IsOptional()
  createdByEmployeeId: number;
}
