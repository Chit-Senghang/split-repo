import { IsOptional } from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../../shared-resources/common/dto/base-pagination-query.dto';

export const employeePostProbationReportSearchableColumn = [
  'displayFullNameKh',
  'displayFullNameEn',
  'accountNo'
];

export class EmployeePostProbationReportPaginationDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  month: number;

  @ApiPropertyOptional()
  @IsOptional()
  year: number;

  @ApiPropertyOptional()
  @IsOptional()
  genderId: number;

  @ApiPropertyOptional()
  @IsOptional()
  displayName: string;
}
