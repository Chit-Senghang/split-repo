import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { GeographicTypeEnum } from '../../database/data/geographic-type.enum';

export class PaginationGeographicDto extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  nameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  nameKh: string;

  @ApiPropertyOptional()
  @IsIn(Object.values(GeographicTypeEnum))
  @IsOptional()
  geographicType: GeographicTypeEnum;
}
