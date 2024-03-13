import { IsInt } from 'class-validator';

export class LeaveRemainingReportDto {
  data: LeaveTypeReportDto;
}

export class LeaveTypeReportDto {
  @IsInt()
  reportId: number;

  // eslint-disable-next-line no-undef
  [key: string]: number;
}
