/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from '../google/protobuf/empty.pb';
export const protobufPackage = 'Authentication';
export interface userParams {
  userId: number;
  consumerId?: string;
  disableUser?: boolean;
}

export interface userVerificationId {
  userVerificationId: number;
}

export interface permissionList {
  permission: string[];
}

export interface User {
  username: string;
  id: number;
  email: string;
  phone: string;
  resetPassword: boolean;
  isSelfService: boolean;
}

export interface userPhone {
  userId: number;
  phone: string;
}

export interface createUser {
  username: string;
  password: string;
  phone: string;
  email: string;
  roles: number[];
  resetPassword: boolean;
}

export interface Template {
  id: number;
  name: string;
  type: string;
}

export interface pageMeta {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  nextPage: number;
  prevPage: number;
  lastPage: number;
}

export interface pagination {
  type?: string;
  limit?: number;
  offset?: number;
}

export interface reasonTemplateId {
  id: number;
}

export interface ErrorResponse {
  statusCode: number;
  msg: string;
}

export interface createAuditLoggingDto {
  requestJson?: string;
  requestMethod?: string;
  requestUrl?: string;
  ipAddress?: string;
  createdBy?: number;
}

export interface auditLoggingId {
  auditLoggingId: number;
}

export interface globalConfigurationName {
  name: string;
}

export interface globalConfigurationDto {
  id: number;
  name: string;
  isSystemDefined: boolean;
  isEnable: boolean;
  value: string;
}

export interface requesterTemplate {
  id: number;
  positionLevelId: number;
  companyStructureDepartment: number;
}

export interface RequestApprovalWorkflow {
  id: number;
  enable: boolean;
  description: string;
  requesters: requesterTemplate[];
  requestFors: requesterTemplate[];
  firstApprovers: requesterTemplate[];
  secondApprovers: requesterTemplate[];
  acknowledgers: requesterTemplate[];
}

export interface statusTracking {
  workflowTypeId: number;
  entityId: number;
}
export interface requestWorkflowDto {
  requestWorkflowId: number;
  positionLevelId: number;
}

export interface params {
  workflowTypeId: number;
  positionLevelId: number;
}

export interface workflowTypeName {
  type: string;
}

export interface approvalStatusTrackingDto {
  approvalWorkflowId: number;
  requestWorkflowTypeId: number;
  entityId: number;
  requestToUpdateBy: number;
  requestToUpdateJson: string;
  requestToUpdateChanges: string;
  firstApprovalUser: number;
  secondApprovalUser: number;
  status: string;
}

export interface workflowTypeDto {
  id: number;
  requestType: string;
}

export interface paramId {
  id: number;
}

export interface mediaDto {
  id: number;
  entityType: string;
  entityId: number;
  mimeType: string;
  size: number;
  name: string;
  filename: string;
  description: string;
}

export interface roleName {
  name: string;
}

export interface roleDto {
  id: number;
  name: string;
}

export interface generateTokenDto {
  employeeId: number;
  userId: number;
}

export interface generateTokenResponse {
  refreshToken: string;
  accessToken: string;
}

export interface generateOtpDto {
  phone: string;
  email: string;
}

export interface generateOtpResponse {
  key: string;
  code?: string;
}

export const AUTHENTICATION_PACKAGE_NAME = 'Authentication';
export interface AuthenticationServiceClient {
  getUser(request: userParams): Observable<User>;
  getUserPermission(request: userParams): Observable<permissionList>;
  createUserVerification(request: userPhone): Observable<userVerificationId>;
  createNewUser(request: createUser): Observable<userParams>;
  deleteUser(request: userParams): Observable<Empty>;
  getReasonTemplates(): Observable<{ data: Template[] }>;
  getOneReasonTemplate(
    reasonTemplateId: reasonTemplateId
  ): Observable<{ data: Template }>;
  createAuditLogging(
    createAuditLogging: createAuditLoggingDto
  ): Observable<auditLoggingId>;
  getGlobalConfigurationByName(
    name: globalConfigurationName
  ): Observable<globalConfigurationDto>;
  getWorkflowType(name: workflowTypeName): Observable<workflowTypeDto>;
  getApprovalWorkflow(workflowTypeId: params): Observable<requestWorkflowDto>;
  createApprovalStatusTracking(
    createApprovalStatusTrackingDto: approvalStatusTrackingDto
  ): Observable<paramId>;
  deleteApprovalStatusTracking(params: statusTracking): Observable<Empty>;
  getMedia(enttiyId: paramId): Observable<{ data: mediaDto[] }>;
  getRoleByRoleName(param: roleName): Observable<roleDto>;
  generateToken(param: generateTokenDto): Observable<generateTokenResponse>;
  deleteUserById(param: userParams): Observable<Empty>;
  generateOtp(
    otpDto: generateOtpDto
  ): Observable<{ data: generateOtpResponse }>;
  updateEmployeeMpath(userId: userParams): Observable<Empty>;
}
export interface AuthenticationServiceController {
  getUser(request: userParams): Promise<User> | Observable<User> | User;
  getUserPermission(
    request: userParams
  ): Promise<permissionList> | Observable<permissionList> | permissionList;
  createUserVerification(
    request: userPhone
  ):
    | Promise<userVerificationId>
    | Observable<userVerificationId>
    | userVerificationId;
  createNewUser(
    request: createUser
  ): Promise<userParams> | Observable<userParams> | userParams;
  deleteUser(request: userParams): void;
  createAuditLogging(
    createAuditLogging: createAuditLoggingDto
  ): Observable<auditLoggingId> | Promise<auditLoggingId>;
  getGlobalConfigurationByName(
    name: globalConfigurationName
  ): Observable<globalConfigurationDto> | Promise<globalConfigurationDto>;
  getRoleByRoleName(param: roleName): Promise<roleDto>;
  generateToken(param: generateTokenDto): Promise<generateTokenResponse>;
  deleteUserById(param: userParams): Promise<Empty>;
  generateOtp(otpDto: generateOtpDto): Promise<{ data: generateOtpResponse }>;
  updateEmployeeMpath(userId: userParams): Promise<Empty>;
}
export function AuthenticationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getUser',
      'getUserPermission',
      'createUserVerification',
      'createNewUser',
      'deleteUser',
      'getReasonTemplates',
      'getOneReasonTemplate',
      'createAuditLogging',
      'getGlobalConfigurationByName',
      'getRoleByRoleName',
      'generateToken',
      'deleteUserById',
      'generateOtp'
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('AuthenticationService', method)(
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
      GrpcStreamMethod('AuthenticationService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}
export const AUTHENTICATION_SERVICE_NAME = 'AuthenticationService';
