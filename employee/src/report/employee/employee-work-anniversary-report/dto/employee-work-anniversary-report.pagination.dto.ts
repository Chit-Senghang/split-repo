import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../../shared-resources/common/dto/base-pagination-query.dto';

export const employeeAnniversaryReportSearchableColumn = [
  'displayFullNameKh',
  'displayFullNameEn',
  'accountNo'
];

export class EmployeeWorkAnniversaryReportPaginationDto extends OmitType(
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
}
