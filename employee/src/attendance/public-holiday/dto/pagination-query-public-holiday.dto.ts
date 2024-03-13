import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../shared-resources/common/dto/base-pagination-query.dto';

export class PaginationQueryPublicHolidayDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  bonusPercentage: number;

  @ApiPropertyOptional({
    type: Number,
    example: 'format (YYYY)'
  })
  @IsOptional()
  @MaxLength(4)
  @Transform(({ value }) => value.trim())
  year: number;

  @ApiPropertyOptional({
    type: Number,
    example: 'format (MM)'
  })
  @IsOptional()
  @MaxLength(2)
  @Transform(({ value }) => value.trim())
  month: number;
}
