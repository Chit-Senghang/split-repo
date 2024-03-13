import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeContactDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ obj }) => obj?.contact?.replace(/\s+/g, ''))
  contact: string;

  @IsNotEmpty()
  @IsBoolean()
  isDefault: boolean;

  @IsString()
  @MaxLength(4)
  @IsOptional()
  countryCode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
