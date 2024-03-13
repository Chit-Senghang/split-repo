import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, MaxLength } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../shared-resources/common/dto/base-pagination-query.dto';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT
} from '../../../shared-resources/common/dto/default-date-format';

export class PaginationQueryAttendanceRecordDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional({
    type: Number,
    example: 'employeeId'
  })
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional({
    type: Date,
    example: `Format (${DEFAULT_DATE_FORMAT})`
  })
  @IsOptional()
  @MaxLength(10)
  @Transform(({ value }) => value.trim())
  fromDate: Date;

  @ApiPropertyOptional({
    type: Date,
    example: `Format (${DEFAULT_DATE_FORMAT})`
  })
  @MaxLength(10)
  @IsOptional()
  @Transform(({ value }) => value.trim())
  toDate: Date;

  @ApiPropertyOptional({
    type: String,
    example: `Format (${DEFAULT_TIME_FORMAT})`
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  fromTime: string;

  @ApiPropertyOptional({
    type: Date,
    example: `Format (${DEFAULT_TIME_FORMAT})`
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  toTime: string;

  @ApiPropertyOptional({
    type: String,
    required: false
  })
  @IsOptional()
  fingerPrintId: string;

  @ApiPropertyOptional({
    type: Number,
    example: 'key for filter companyStructureStoreId'
  })
  @IsOptional()
  companyStructureStoreId: number;

  @ApiPropertyOptional({
    type: Boolean,
    required: false
  })
  @IsOptional()
  isMissedScan: boolean;
}
