import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';

export class ToBankPagination {
  @IsOptional()
  @IsString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  paymentMethodId: number;
}

export class SummaryPaginationDto {
  @Min(1)
  @Max(12)
  @IsInt()
  @IsOptional()
  month: number;
}
