import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { EmployeeMovementStatusEnum } from '../ts/enums/movement-status.enum';
import { BasePaginationQueryWithAuditDto } from '../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class PaginationQueryEmployeeMovementDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousWorkingShiftId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  newWorkingShiftId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  effectiveDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  status: EmployeeMovementStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastMovementDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;
}
