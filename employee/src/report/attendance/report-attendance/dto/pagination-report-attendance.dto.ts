import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString } from 'class-validator';
import { AttendanceReportStatusEnum } from '../../../../../../employee/src/attendance/attendance-report/enum/attendance-report-status.enum';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../../shared-resources/common/dto/base-pagination-query.dto';
import { ReportAttendanceEnum } from '../enum/report-attendance.enum';

export class PaginationReportAttendanceDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  date: Date | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(AttendanceReportStatusEnum))
  status: AttendanceReportStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(ReportAttendanceEnum))
  type: ReportAttendanceEnum;

  @ApiPropertyOptional()
  @IsOptional()
  genderId: number;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  contactNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional({
    type: String
  })
  @IsOptional()
  @IsString()
  displayName: string;
}
