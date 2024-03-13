import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class AuditLoggingPaginationDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId: string;
}
