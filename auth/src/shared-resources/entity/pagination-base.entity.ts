import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationBaseQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  take: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['ASC', 'asc', 'DSC', 'dsc'])
  order: string;

  @ApiPropertyOptional()
  orderBy: string;
}
