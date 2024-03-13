import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationEmployeeEducationDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  educationTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  instituteName: string;

  @ApiPropertyOptional()
  @IsOptional()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;
}
