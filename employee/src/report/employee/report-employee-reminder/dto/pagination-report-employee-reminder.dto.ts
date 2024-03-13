import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationReportEmployeeReminder {
  @ApiPropertyOptional()
  @IsOptional()
  date: string;
}
