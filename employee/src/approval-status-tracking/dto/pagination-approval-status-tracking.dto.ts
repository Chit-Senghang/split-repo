import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../shared-resources/common/dto/base-pagination-query.dto';
import { ApprovalStatusEnum } from '../common/ts/enum/approval-status.enum';

export class ApprovalStatusTrackingPagination extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.keys(ApprovalStatusEnum))
  status: ApprovalStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  entityId: number;

  @ApiPropertyOptional()
  @IsOptional()
  requestWorkflowTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeName: string;

  @ApiPropertyOptional()
  @IsOptional()
  positionId: number;

  @ApiPropertyOptional()
  @IsOptional()
  approverId: number;

  @ApiPropertyOptional()
  @IsOptional()
  requesterId: number;

  @ApiPropertyOptional()
  @IsOptional()
  outletId: number;

  @ApiPropertyOptional()
  @IsOptional()
  departmentId: number;

  @ApiPropertyOptional()
  @IsOptional()
  teamId: number;
}
