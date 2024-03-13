import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';
import { AUDIT_BASE_ORDERBY_OPTIONS } from '../../ts/constants/audit-base-orderby.constants';
import { PAGINATION_ORDER_DIRECTION } from '../../ts/enum/pagination-order-direction.enum';
import { ExportDataTypeEnum } from '../../export-file/common/enum/export.enum';

export class BasePaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(AUDIT_BASE_ORDERBY_OPTIONS)
  orderBy: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PAGINATION_ORDER_DIRECTION)
  orderDirection?: PAGINATION_ORDER_DIRECTION;

  @ApiPropertyOptional()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  locationId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  outletId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  teamId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  positionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ExportDataTypeEnum)
  exportFileType?: ExportDataTypeEnum;
}

export enum BasePaginationQueryProps {
  LIMIT = 'limit',
  OFFSET = 'offset',
  KEYWORDS = 'keywords',
  ORDER_BY = 'orderBy',
  ORDER_DIRECTION = 'orderDirection',
  EXPORT_FILE_TYPE = 'exportFileType'
}
