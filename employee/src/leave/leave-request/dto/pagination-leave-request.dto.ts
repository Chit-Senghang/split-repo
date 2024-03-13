import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { LeaveRequestDurationTypeEnEnum } from '../enums/leave-request-duration-type.enum';
import { BasePaginationQueryWithAuditDto } from '../../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class PaginationLeaveRequestDto extends BasePaginationQueryWithAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  leaveRequestTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.keys(LeaveRequestDurationTypeEnEnum))
  durationType: LeaveRequestDurationTypeEnEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.keys(StatusEnum))
  status: StatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;
}
