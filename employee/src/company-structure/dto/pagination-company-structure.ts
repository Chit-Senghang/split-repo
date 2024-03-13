import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { CompanyStructureTypeEnum } from '../common/ts/enum/structure-type.enum';

export class PaginationQueryCompanyStructureDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(CompanyStructureTypeEnum)
  type: CompanyStructureTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionLevelNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyStructureComponentId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  parentId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fingerprintDeviceId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(CompanyStructureTypeEnum)
  companyComponentType: CompanyStructureTypeEnum;
}
