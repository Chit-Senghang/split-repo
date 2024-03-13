import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @Validate(PhoneValidator)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  key: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  code: string;
}
