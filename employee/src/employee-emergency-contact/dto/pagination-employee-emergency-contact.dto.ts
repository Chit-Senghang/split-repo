import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationEmployeeEmergencyContactDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  contact: string;

  @ApiPropertyOptional()
  @IsOptional()
  contactRelationshipId: number;

  @ApiPropertyOptional()
  @IsOptional()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;
}
