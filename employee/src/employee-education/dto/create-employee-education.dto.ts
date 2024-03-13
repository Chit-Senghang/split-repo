import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateEmployeeEducationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  educationTypeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  instituteName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  major: string;

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
