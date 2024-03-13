import { IsArray, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateDayOffRequestDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  employeeId: number;

  @IsArray()
  @IsNotEmpty()
  dayOffDate: [];
}
