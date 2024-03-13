import { IsNotEmpty, Validate } from 'class-validator';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class GetOtpMekongDto {
  @IsNotEmpty()
  @Validate(PhoneValidator)
  phone: string;
}
