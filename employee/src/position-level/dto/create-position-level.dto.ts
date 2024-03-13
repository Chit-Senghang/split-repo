import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class CreatePositionLevelDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsString()
  levelTitle: string;

  @IsNotEmpty()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 5
  })
  levelNumber: number;
}
