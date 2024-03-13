import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { MediaEntityTypeEnum } from '../common/ts/enums/entity-type.enum';

export class PaginationMediaDto extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  entityId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(MediaEntityTypeEnum)
  entityType: MediaEntityTypeEnum;
}
