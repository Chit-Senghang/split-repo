import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { User } from '../user/entities/user.entity';
import { RedisCacheModule } from '../cache/cache.module';
import { OtpModule } from '../otp/otp.module';
import { GrpcModule } from '../grpc/grpc.module';
import { Role } from '../role/entities/role.entity';
import { EnvironmentService } from '../config/environment.service';
import { EnvironmentModule } from '../config/environment.module';
import { AuthController } from './authentication.controller';
import { KongJwtService } from './kong-jwt.service';
import { AuthenticationService } from './authentication.service';

@Global()
@Module({
  imports: [
    PassportModule,
    RedisCacheModule,
    GrpcModule,
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        secret: environmentService.getStringValue('JWT_SECRET'),
        signOptions: {
          expiresIn: environmentService.getNumberValue('JWT_EXPIRE')
        }
      }),
      inject: [EnvironmentService]
    }),
    OtpModule
  ],
  providers: [AuthenticationService, JwtStrategy, KongJwtService],
  exports: [AuthenticationService, KongJwtService],
  controllers: [AuthController]
})
export class AuthenticationModule {}
