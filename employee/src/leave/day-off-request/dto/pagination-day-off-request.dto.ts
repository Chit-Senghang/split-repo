import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { BasePaginationQueryWithAuditDto } from '../../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class PaginationDayOffRequestDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  status: StatusEnum[];

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;
}
