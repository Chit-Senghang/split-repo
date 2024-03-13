import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateEmployeeVaccinationDto {
  @IsInt()
  @IsNotEmpty()
  vaccinationId: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  cardNumber: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
