import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { ReasonTemplateTypeEnum } from '../common/ts/enum/type.enum';

export class PaginationReasonTemplateDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsIn(Object.values(ReasonTemplateTypeEnum))
  @IsOptional()
  type: ReasonTemplateTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  listAll: boolean;
}
