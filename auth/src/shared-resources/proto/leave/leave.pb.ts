/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'Leave';

export const LEAVE_PACKAGE_NAME = 'Leave';

export interface updateStatusParams {
  id: number;
  type?: string;
  status: string;
}

export interface paramId {
  id: number;
  type?: string;
}

export interface RequestDto {
  id: number;
  reason: string;
  status: string;
  fromDate: string;
  toDate: string;
  durationType: string;
  leaveRequestTypeId?: number;
}

export interface getLeaveDto {
  entityId: number;
  type: string;
  employeeName?: string;
  positionId?: number;
  outletId?: number;
}

export interface getLeaveResponse {
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

export interface LeaveServiceClient {
  updateLeaveStatus(request: updateStatusParams): Observable<paramId>;
  getRequest(paramId: paramId): Observable<RequestDto>;
  getLeaveByEntityId(requestDto: getLeaveDto): Observable<getLeaveResponse>;
}

export interface LeaveServiceController {
  updateLeaveStatus(request: updateStatusParams): Promise<paramId>;
  getRequest(paramId: paramId): Promise<RequestDto>;
  getLeaveByEntityId(requestDto: getLeaveDto): Promise<getLeaveResponse>;
}

export function LeaveControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'updateLeaveStatus',
      'getRequest',
      'getLeaveByEntityId'
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('LeaveService', method)(
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
      GrpcStreamMethod('LeaveService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const LEAVE_SERVICE_NAME = 'LeaveService';
