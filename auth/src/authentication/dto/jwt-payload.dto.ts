import { Expose } from 'class-transformer';
import { SetPasswordOption } from '../common/ts/enum/setpassword.enum';

export class JwtPayload {
  @Expose({ name: 'refresh_token' })
  refreshToken?: boolean;

  @Expose({ name: 'phone_number' })
  phoneNumber: string;

  email: string;

  employeeId: string;

  iss: string;

  setPasswordOption?: SetPasswordOption;

  credentialId?: string;
}
