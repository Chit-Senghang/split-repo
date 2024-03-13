import { join } from 'path';
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentEnum } from '../shared-resources/common/enums/environment.enum';
import { getProtoPath } from '../shared-resources/utils/proto-utils';
import {
  AttendanceProto,
  EmployeeProto,
  SchedulerProto
} from '../shared-resources/proto';
import { GrpcController } from './grpc.controller';
import { GrpcService } from './grpc.service';

const protoDir = getProtoPath(process.env.NODE_ENV);

@Global()
@Module({
  controllers: [GrpcController],
  imports: [
    ClientsModule.register([
      {
        name: EmployeeProto.EMPLOYEE_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: EmployeeProto.EMPLOYEE_PACKAGE_NAME,
          protoPath: join(protoDir, 'employee.proto'),
          url:
            process.env.NODE_ENV === EnvironmentEnum.LOCAL
              ? '0.0.0.0:50000'
              : 'hrm_employee:50000'
        }
      },
      {
        name: AttendanceProto.ATTENDANCE_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AttendanceProto.ATTENDANCE_PACKAGE_NAME,
          protoPath: join(protoDir, 'attendance.proto'),
          url:
            process.env.NODE_ENV === EnvironmentEnum.LOCAL
              ? '0.0.0.0:60000'
              : 'hrm_attendance:60000'
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
