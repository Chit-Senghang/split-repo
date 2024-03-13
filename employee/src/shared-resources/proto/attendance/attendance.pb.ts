/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'Attendance';

export const ATTENDANCE_PACKAGE_NAME = 'Attendance';
export interface updateStatusParams {
  id: number;
  type?: string;
  status: string;
}

export interface attendanceId {
  id: number;
}

export interface getAttendanceDto {
  entityId: number;
  type: string;
  employeeName?: string;
  positionId?: number;
  outletId?: number;
}

export interface getAttendanceResponse {
  id: number;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
  email: string;
  location?: string;
  outlet?: string;
  department?: string;
  position?: string;
  displayFullNameEn?: string;
  employeeId?: number;
}
export interface AttendanceServiceClient {
  updateAttendanceStatus(param: updateStatusParams): Observable<attendanceId>;
  getAttendanceByEntityId(
    requestDto: getAttendanceDto
  ): Observable<getAttendanceResponse>;
}

export interface AttendanceServiceController {
  updateAttendanceStatus(param: updateStatusParams): Promise<attendanceId>;
  getAttendanceByEntityId(
    requestDto: getAttendanceDto
  ): Promise<getAttendanceResponse>;
}

export function AttendanceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'updateAttendanceStatus',
      'getAttendanceByEntityId'
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('AttendanceService', method)(
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
      GrpcStreamMethod('AttendanceService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const ATTENDANCE_SERVICE_NAME = 'AttendanceService';
