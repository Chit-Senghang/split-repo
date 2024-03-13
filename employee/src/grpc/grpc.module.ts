import { join } from 'path';
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { getProtoPath } from '../shared-resources/utils/proto-utils';
import {
  AuthenticationProto,
  SchedulerProto
} from '../shared-resources/proto';
import { EnvironmentEnum } from '../shared-resources/common/enums/environment.enum';
import { GrpcService } from './grpc.service';
import { GrpcController } from './grpc.controller';

const protoDir = getProtoPath(process.env.NODE_ENV);

@Global()
@Module({
  controllers: [GrpcController],
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === EnvironmentEnum.LOCAL
          ? `${process.cwd()}/apps/employee/.env`
          : `${process.cwd()}/.env`
    }),
    ClientsModule.register([
      {
        name: AuthenticationProto.AUTHENTICATION_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AuthenticationProto.AUTHENTICATION_PACKAGE_NAME,
          protoPath: join(protoDir, 'authentication.proto'),
          url:
            process.env.NODE_ENV === EnvironmentEnum.LOCAL
              ? '0.0.0.0:40000'
              : 'hrm_authentication:40000'
        }
      },
      {
        name: SchedulerProto.SCHEDULER_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: SchedulerProto.SCHEDULER_PACKAGE_NAME,
          protoPath: join(protoDir, 'scheduler.proto'),
          url:
            process.env.NODE_ENV === EnvironmentEnum.LOCAL
              ? '0.0.0.0:30000'
              : 'hrm_scheduler:30000'
        }
      }
    ])
  ],
  providers: [GrpcService],
  exports: [GrpcService]
})
export class GrpcModule {}
