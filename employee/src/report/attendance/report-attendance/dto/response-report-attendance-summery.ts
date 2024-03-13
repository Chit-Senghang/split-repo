import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseReportAttendanceSummary {
  @ApiPropertyOptional()
  reportId: number;

  @ApiPropertyOptional()
  present: number;

  @ApiPropertyOptional()
  absent: number;
}
