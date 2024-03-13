import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { BasePaginationQueryWithAuditDto } from '../../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class PaginationQueryMissedScanRequestDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

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
  fromDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(StatusEnum))
  status: StatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;
}
