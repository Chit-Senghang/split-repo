import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateWorkshiftTypeDto {
  @IsNotEmpty()
  @IsInt()
  workingDayQty: number;
}
