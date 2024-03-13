/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";

export const protobufPackage = "Payroll";

export const PAYROLL_PACKAGE_NAME = "Payroll";
export interface PayrollServiceClient {}

export interface PayrollServiceController {}

export function PayrollControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("PayrollService", method)(
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
      GrpcStreamMethod("PayrollService", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const PAYROLL_SERVICE_NAME = "PayrollService";
