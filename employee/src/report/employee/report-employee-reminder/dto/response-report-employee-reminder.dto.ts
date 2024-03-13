import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseReportEmployeeReminderDto {
  @ApiPropertyOptional()
  reportId: number;

  @ApiPropertyOptional()
  totalEmployeeBirthdayCount: number;

  @ApiPropertyOptional()
  totalEmployeePostProbationCount: number;

  @ApiPropertyOptional()
  totalEmployeeWorkAnniversaryCount: number;

  @ApiPropertyOptional()
  totalPublicHolidayCount: number;
}
