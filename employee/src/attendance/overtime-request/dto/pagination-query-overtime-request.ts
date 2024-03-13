import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';
import { OvertimeTypeEnum } from '../../../shared-resources/common/enums/overtime-type.enum';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { BasePaginationQueryWithAuditDto } from '../../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class PaginationQueryOvertimeRequestDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  toDate: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  startTime: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  endTime: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  overTimeStatus: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  overtimeRequestTypeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  status: StatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(OvertimeTypeEnum))
  overtimeType: OvertimeTypeEnum;
}
