import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class EmployeeContactPagination extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  contact: string;

  @ApiPropertyOptional()
  @IsOptional()
  firstNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  lastNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  firstNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  lastNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;
}
