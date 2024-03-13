import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationEmployeeSkillDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  skillId: number;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;
}
