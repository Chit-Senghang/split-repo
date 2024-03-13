import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateEmployeeIdentifierDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  documentTypeId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  documentIdentifier: string;

  @IsOptional()
  expireDate: Date;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
