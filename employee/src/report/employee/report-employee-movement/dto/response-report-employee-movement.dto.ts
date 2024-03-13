import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseReportEmployeeMovementDto {
  @ApiPropertyOptional()
  reportId: number;

  @ApiPropertyOptional()
  newEmployeeCount: number;

  @ApiPropertyOptional()
  resignEmployeeCount: number;
}
