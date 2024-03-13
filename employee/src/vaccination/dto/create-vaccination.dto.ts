import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVaccinationDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
