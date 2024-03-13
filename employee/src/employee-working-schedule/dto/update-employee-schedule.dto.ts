import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsMilitaryTime,
  IsNotEmpty,
  ValidateNested
} from 'class-validator';

export class UpdateEmployeeWorkingScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedObject)
  data: NestedObject[];
}

class NestedObject {
  @IsInt()
  id: number;

  @IsNotEmpty()
  scheduleDate: Date;

  @IsMilitaryTime()
  startWorkingTime: Date;

  @IsMilitaryTime()
  endWorkingTime: Date;
}
