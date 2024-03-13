import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { BulkTypeEnum } from '../enum/type.enum';

export class BulkImportDocumentPaginationDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  entityType: BulkTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  fromImportStartTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  toImportEndTime: string;
}
