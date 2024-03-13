import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../shared-resources/common/dto/base-pagination-query.dto';
import { DEFAULT_DATE_FORMAT } from '../../../shared-resources/common/dto/default-date-format';
import { AttendanceReportStatusEnum } from '../enum/attendance-report-status.enum';

export class PaginationQueryAttendanceReportDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional({
    type: Date,
    example: `Format (${DEFAULT_DATE_FORMAT})`
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => value.trim())
  fromDate: string;

  @ApiPropertyOptional({
    type: Date,
    example: `Format (${DEFAULT_DATE_FORMAT})`
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => value.trim())
  toDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  status: AttendanceReportStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  leaveTitle: string;
}
