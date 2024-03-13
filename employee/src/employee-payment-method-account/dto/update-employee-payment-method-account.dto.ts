import { PartialType } from '@nestjs/swagger';
import { CreateEmployeePaymentMethodAccountDto } from './create-employee-payment-method-account.dto';

export class UpdateEmployeePaymentMethodAccountDto extends PartialType(
  CreateEmployeePaymentMethodAccountDto
) {}
