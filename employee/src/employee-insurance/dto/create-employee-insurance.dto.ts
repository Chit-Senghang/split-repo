import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEmployeeInsuranceDto {
  @IsInt()
  @IsNotEmpty()
  insuranceId: number;

  @IsString()
  @IsOptional()
  cardNumber: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
