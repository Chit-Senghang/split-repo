import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class GetOtpOptionDto {
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
