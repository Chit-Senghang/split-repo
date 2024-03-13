import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { EmployeeWarningStatusEnum } from '../common/ts/enum/status.enum';
import { BasePaginationQueryWithAuditDto } from '../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class EmployeeWarningPaginationDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  warningTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(EmployeeWarningStatusEnum))
  status: EmployeeWarningStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastMovementDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  count: number;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;
}
