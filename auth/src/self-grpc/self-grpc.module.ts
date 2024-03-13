import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuditLoggingService } from '../audit-logging/audit-logging.service';
import { AuditLog } from '../audit-logging/entities/audit-logging.entity';
import { KongJwtService } from '../authentication/kong-jwt.service';
import { GlobalConfiguration } from '../global-configuration/entities/global-configuration.entity';
import { GlobalConfigurationService } from '../global-configuration/global-configuration.service';
import { Role } from '../role/entities/role.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { TwilioService } from '../otp/twilio.service';
import { MailService } from '../otp/mail.service';
import { FirebaseService } from '../otp/firebase.service';
import { MekongService } from '../otp/mekong.services';
import { SelfGrpcController } from './self-grpc.controller';
import { SelfGrpcService } from './self-grpc.service';

@Module({
  controllers: [SelfGrpcController],
  providers: [
    SelfGrpcService,
    UserService,
    KongJwtService,
    ConfigService,
    AuditLoggingService,
    GlobalConfigurationService,
    AuthenticationService,
    JwtService,
    TwilioService,
    MailService,
    FirebaseService,
    MekongService
  ],
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Role,
      AuditLog,
      GlobalConfiguration
    ])
  ]
})
export class SelfGrpcModule {}
