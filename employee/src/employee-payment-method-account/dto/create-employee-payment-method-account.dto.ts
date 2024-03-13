import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateEmployeePaymentMethodAccountDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  paymentMethodId: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  accountNumber: string;

  @IsOptional()
  @IsBoolean()
  isDefaultAccount: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
