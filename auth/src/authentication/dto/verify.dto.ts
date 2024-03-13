import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  Validate
} from 'class-validator';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class VerifyOtpDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Validate(PhoneValidator)
  phone: string;

  @IsUUID()
  key: string;

  @IsString()
  @MinLength(6)
  code: string;

  @IsOptional()
  @IsString()
  password: string;
}
