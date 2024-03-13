import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { EmployeeResignationStatusEnum } from '../common/ts/enums/employee-resignation-status.enum';
import { BasePaginationQueryWithAuditDto } from '../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class ResignationPaginationDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  resignTypeId: number;

  @ApiPropertyOptional({ example: `format ${DEFAULT_DATE_FORMAT}` })
  @IsOptional()
  resignFromDate: Date;

  @ApiPropertyOptional({ example: `format ${DEFAULT_DATE_FORMAT}` })
  @IsOptional()
  resignToDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameKh: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(EmployeeResignationStatusEnum))
  status: EmployeeResignationStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsOptional()
  lastMovementDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;

  @ApiPropertyOptional()
  @IsOptional()
  resignEmployeeInMonth: Date;
}
