import { OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { CodeTypesEnum } from '../ts/enums/permission.enum';

export class PaginationCodeValueDto extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsIn(Object.keys(CodeTypesEnum))
  code: CodeTypesEnum;

  @ApiPropertyOptional()
  @IsOptional()
  isEnabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  isSystemDefined: boolean;
}
