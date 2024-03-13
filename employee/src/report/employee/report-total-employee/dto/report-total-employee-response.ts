import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportTotalEmployeeResponse {
  @ApiPropertyOptional()
  reportId: number;

  @ApiPropertyOptional()
  totalEmployeeCount: number;

  @ApiPropertyOptional()
  totalEmployeeInProbationCount: number;

  @ApiPropertyOptional()
  totalEmployeePostProbationCount: number;

  @ApiPropertyOptional()
  totalEmployeePartTimeCount: number;

  @ApiPropertyOptional()
  totalEmployeeFullTimeCount: number;

  @ApiPropertyOptional()
  totalEmployeeFemaleCount: number;

  @ApiPropertyOptional()
  totalEmployeeMaleCount: number;
}
