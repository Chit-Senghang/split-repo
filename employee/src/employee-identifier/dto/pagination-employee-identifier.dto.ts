import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationEmployeeIdentifierDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  documentTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  documentIdentifier: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayFullNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  expireDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;
}
