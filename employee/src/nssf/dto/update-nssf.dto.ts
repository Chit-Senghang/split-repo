import { IsNumber, Min } from 'class-validator';

export class UpdateNssfDto {
  @IsNumber()
  @Min(0)
  nssfPersonalAccidentInsurance: number;

  @IsNumber()
  @Min(0)
  nssfHealthInsurance: number;

  @IsNumber()
  @Min(0)
  pensionFundEmployee: number;

  @IsNumber()
  @Min(0)
  pensionFundCompany: number;

  @IsNumber()
  @Min(0)
  totalNSSFPaid: number;
}
