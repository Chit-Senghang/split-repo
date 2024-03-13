import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { ScanTypeEnum } from '../../common/ts/enum/status-type.enum';

export class CreateWorkingShiftDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  workshiftTypeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsMilitaryTime()
  @IsNotEmpty()
  startWorkingTime: Date;

  @IsMilitaryTime()
  @IsNotEmpty()
  endWorkingTime: Date;

  @IsNotEmpty()
  @IsIn(Object.values(ScanTypeEnum))
  scanType: ScanTypeEnum;

  @IsOptional()
  startScanTimePartOne: Date;

  @IsOptional()
  endScanTimePartOne: Date;

  @IsOptional()
  startScanTimePartTwo: Date;

  @IsOptional()
  endScanTimePartTwo: Date;

  @IsOptional()
  @IsInt()
  breakTime: number;

  @IsOptional()
  @IsBoolean()
  workOnWeekend: boolean;

  @IsOptional()
  weekendScanTime: Date;
}
