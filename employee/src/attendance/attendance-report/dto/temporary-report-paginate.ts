import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class TemporaryReportPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  employeeId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  storeId: number;
}
