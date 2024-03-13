import { IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdatePositionDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  employeePositionId: number;

  @IsNotEmpty()
  @IsBoolean()
  isDefaultPosition: boolean;
}
