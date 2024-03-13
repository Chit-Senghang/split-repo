import { IsNotEmpty, Max, Min } from 'class-validator';

export class LeaveStockDetailPaginationDto {
  @IsNotEmpty()
  year: number;

  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number;
}
