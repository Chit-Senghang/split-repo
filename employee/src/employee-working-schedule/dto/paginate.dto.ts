import { IsOptional, IsString } from 'class-validator';

export class EmployeeWorkingSchedulePaginationDto {
  @IsOptional()
  @IsString()
  fromDate: Date;

  @IsOptional()
  @IsString()
  toDate: Date;
}
