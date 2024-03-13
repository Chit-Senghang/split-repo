import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { iBankingReportFormatEnum } from '../enum/ibanking-report-format.enum';

export class CreatePaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsIn(Object.values(iBankingReportFormatEnum))
  iBankingReportFormat: string;

  @IsOptional()
  isSystemDefined: boolean;
}
