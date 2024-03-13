import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInsuranceDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
