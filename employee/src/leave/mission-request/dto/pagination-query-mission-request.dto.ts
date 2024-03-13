import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';
import { MissionRequestDurationTypeEnEnum } from '../enum/mission-request-duration-type.enum';
import { BasePaginationQueryWithAuditDto } from '../../../shared-resources/common/dto/base-pagination-query-with-audit-base.dot';

export class PaginationQueryMissionRequestDto extends BasePaginationQueryWithAuditDto {
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
  @IsIn(Object.keys(MissionRequestDurationTypeEnEnum))
  durationType: MissionRequestDurationTypeEnEnum;

  @IsOptional()
  @ApiPropertyOptional()
  displayFullNameEn: string;

  @IsOptional()
  @ApiPropertyOptional()
  accountNo: string;

  @IsOptional()
  @ApiPropertyOptional()
  status: StatusEnum;

  @IsOptional()
  @ApiPropertyOptional()
  missionRequestStatus: string;

  @IsOptional()
  @ApiPropertyOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  reasonTemplateId: number;
}
