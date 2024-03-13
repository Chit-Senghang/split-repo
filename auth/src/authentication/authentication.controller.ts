import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UnauthorizedResourceException } from '../shared-resources/exception';
import { GrpcService } from '../grpc/grpc.service';
import { AuthenticationService } from './authentication.service';
import {
  ChangePasswordDto,
  LoginDto,
  VerifyOtpDto,
  GetOtpOptionDto,
  NewPasswordDto
} from './dto';
import { CreateUserAccessToken } from './dto/access-token-firebase.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GetOtpMekongDto } from './dto/get-otp-mekong.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly grpcService: GrpcService
  ) {}

  @Get('health')
  async getHealthCheckStatus(): Promise<string> {
    const employeeApplication =
      await this.grpcService.checkEmployeeApplicationRunning();

    const schedulerApplication =
      await this.grpcService.checkSchedulerApplicationRunning();

    if (
      employeeApplication.status === 'OK' &&
      schedulerApplication.status === 'OK'
    ) {
      return 'OK';
    } else {
      return 'NO';
    }
  }

  @Post('otp')
  setupOtp(@Body() otpReceivedOption: GetOtpOptionDto) {
    return this.authenticationService.getOtp(otpReceivedOption);
  }

  @Post('verify')
  verifyExistingUser(
    @Body() verifyPhone: VerifyOtpDto,
    @Query('rest') rest: boolean
  ) {
    return this.authenticationService.verify(verifyPhone, rest);
  }

  @Post('get-otp')
  getOPtMekong(@Body() phone: GetOtpMekongDto) {
    return this.authenticationService.getOtpMekong(phone);
  }

  @Post('active-account-create-new-user')
  createNewUserAccountActive(@Body() dto: CreateUserAccessToken) {
    return this.authenticationService.createNewUserAccountActive(dto);
  }

  @Patch('self-password')
  @ApiBearerAuth()
  setSelfPassword(
    @Headers('Authorization') bearerToken: string,
    @Body() newPasswordDto: NewPasswordDto
  ) {
    const bearerTokenSplit = bearerToken.split(' ');
    if (bearerTokenSplit.length !== 2) {
      throw new UnauthorizedResourceException();
    }
    return this.authenticationService.setSelfNewPassword(
      newPasswordDto.newPassword,
      bearerTokenSplit[1]
    );
  }

  @Patch('forgot-password')
  forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authenticationService.forgotPassword(forgotDto);
  }

  @Post('login')
  login(@Headers() headers: any, @Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto, headers);
  }

  @Patch('password')
  @ApiBearerAuth()
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authenticationService.changePassword(changePasswordDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  async logout(@Headers('x-credential-identifier') credentialId: string) {
    return this.authenticationService.logout(credentialId);
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  async getNewToken(
    @Headers('x-credential-identifier') credentialId: string,
    @Headers('x-consumer-username') user: string,
    @Headers('x-consumer-custom-id') employeeId: string,
    @Headers('Authorization') bearerToken: string
  ) {
    const bearerTokenSplit = bearerToken.split(' ');
    if (bearerTokenSplit.length !== 2) {
      throw new UnauthorizedResourceException();
    }

    const accessToken =
      await this.authenticationService.generateNewTokenByRefreshToken(
        credentialId,
        user,
        employeeId,
        bearerTokenSplit[1]
      );

    return accessToken;
  }
}
