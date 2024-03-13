import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Validate
} from 'class-validator';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  @Validate(PhoneValidator)
  phone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsArray()
  @ArrayMinSize(1)
  roles: number[];

  @IsBoolean()
  @IsOptional()
  resetPassword: boolean;

  @IsBoolean()
  isSelfService?: boolean;
}
