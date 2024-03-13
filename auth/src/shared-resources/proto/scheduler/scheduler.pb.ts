/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from '../google/protobuf/empty.pb';

export const protobufPackage = 'Scheduler';

export interface ApplicationStatus {
  status: string;
}
export interface SchedulerServiceClient {
  handleFingerPrint(param: Empty): Observable<Empty>;
  notifyApplicationRunning(param: Empty): Observable<ApplicationStatus>;
}
export interface SchedulerServiceController {
  handleFingerPrint(): Empty;
  notifyApplicationRunning(param: Empty): ApplicationStatus;
}

export function SchedulerControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'handleFingerPrint',
      'notifyApplicationRunning'
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('SchedulerService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod('SchedulerService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const SCHEDULER_PACKAGE_NAME = 'Scheduler';

export const SCHEDULER_SERVICE_NAME = 'SchedulerService';
