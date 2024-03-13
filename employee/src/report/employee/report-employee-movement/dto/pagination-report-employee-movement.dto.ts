import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationReportEmployeeMovementDto {
  @ApiPropertyOptional()
  @IsOptional()
  date: string;
}
