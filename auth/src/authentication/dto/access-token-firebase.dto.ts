import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate
} from 'class-validator';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class CreateUserAccessToken {
  @IsNotEmpty()
  @IsString()
  @Validate(PhoneValidator)
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  key: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  code: string;
}
