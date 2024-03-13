import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateEmployeeLanguageDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  languageId: number;
}
