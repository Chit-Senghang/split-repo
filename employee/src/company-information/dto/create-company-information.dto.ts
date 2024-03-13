import { IsString, MaxLength, Validate } from 'class-validator';
import { PhoneValidator } from '../../shared-resources/common/utils/custom-validate-phone-number';

export class CreateCompanyInformationDto {
  @IsString()
  @MaxLength(255)
  nameEn: string;

  @IsString()
  @MaxLength(255)
  nameKh: string;

  @IsString()
  @MaxLength(255)
  addressEn: string;

  @IsString()
  @MaxLength(255)
  addressKh: string;

  @IsString()
  @MaxLength(20)
  @Validate(PhoneValidator)
  phoneNumber: string;

  @IsString()
  @MaxLength(255)
  emailAddress: string;
}
