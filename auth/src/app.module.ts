import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditSubscriber } from './shared-resources/common/subscriber/audit-subscriber';
import { rateLimitAuth } from './shared-resources/common/utils/rate-limit';
import { RateLimitGuard } from './shared-resources/gurads/rate-limit-auth';
import { AuditLogMiddleware } from './shared-resources/common/Logger/audit-log-middleware';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { AuditLoggingModule } from './audit-logging/audit-logging.module';
import { GlobalConfigurationModule } from './global-configuration/global-configuration.module';
import { SelfGrpcModule } from './self-grpc/self-grpc.module';
import { EnvironmentService } from './config/environment.service';
import { EnvironmentModule } from './config/environment.module';
import { SystemTestController } from './system-test/system-test.controller';

@Module({
  imports: [
    AuthenticationModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentModule],
      useFactory: async () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'hrm_authentication',
        username: 'postgres',
        password: 'root',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        subscribers: [AuditSubscriber],
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy()
      }),
      inject: [EnvironmentService]
    }),
    UserModule,
    PermissionModule,
    RoleModule,
    RolePermissionModule,
    GlobalConfigurationModule,
    AuditLoggingModule,
    SelfGrpcModule,
    ThrottlerModule.forRoot({
      limit: Number(process.env.RATE_LIMIT),
      ttl: Number(process.env.RATE_LIMIT_TTL),
      skipIf: rateLimitAuth
    })
  ],
  providers: [
    AuditSubscriber,
    { provide: APP_GUARD, useClass: RateLimitGuard }
  ],
  controllers: [SystemTestController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditLogMiddleware).forRoutes('*');
  }
}
