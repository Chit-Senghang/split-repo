import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationWorkShiftDto extends OmitType(BasePaginationQueryDto, [
  BasePaginationQueryProps.ORDER_BY
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  scanType: number;

  @ApiPropertyOptional()
  @IsOptional()
  workingShiftTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  workingShiftId: number;

  @ApiPropertyOptional({
    type: String,
    example: 'with time format (HH:mmm)'
  })
  @IsOptional()
  @IsString()
  startWorkingTime: string;

  @ApiPropertyOptional({
    type: String,
    example: 'with time format (HH:mmm)'
  })
  @IsOptional()
  @IsString()
  endWorkingTime: string;

  @ApiPropertyOptional({
    type: String,
    example: 'with time format (HH:mmm)'
  })
  @IsOptional()
  breakTime: string;

  @ApiPropertyOptional({
    type: Number
  })
  @IsOptional()
  workingHour: number;

  @ApiPropertyOptional({
    type: Boolean,
    example: 'workOnWeekend (true or false)'
  })
  @IsOptional()
  workOnWeekend: boolean;
}
