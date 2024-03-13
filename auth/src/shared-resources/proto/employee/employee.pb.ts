/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from '../google/protobuf/empty.pb';
// import { FingerprintDeviceStatusEnum } from '../../employee/src/finger-print-device/enums/fingerprint-device-status.enum';

export const protobufPackage = 'Employee';

export interface IEmployeeMpath {
  id: number;
  mpath: string[];
}

export interface CurrentEmployeeDto {
  id: number;
  displayFullNameEn: string;
  displayFullNameKh: string;
  mpath: string[];
  gender: string;
  location: string;
  store: string;
  department: string;
  division: string;
  position: string;
  levelNumber: string;
  workingShift: WorkingShiftDto;
  profile: ProfileDto;
  status: string;
}

export interface WorkingShiftDto {
  id: number;
  name: string;
  startWorkingTime: Date;
  endWorkingTime: Date;
}

export interface ProfileDto {
  name: string;
  mimeType: string;
}

export interface CreateUserInfo {
  username: string;
  email: string;
  phone: string;
}

export interface EntityId {
  entityId: number;
  type: string;
  employeeName?: string;
  positionId?: number;
  outletId?: number;
}

export interface EmployeeEmail {
  email: string;
}

export interface Phone {
  phone: string;
}

export interface EmployeeUpdate {
  phone: string;
  email: string;
  userId: number;
}

export interface UpdateEmployeeInformationDto {
  id?: number;
  accountNo?: string;
  fingerPrintId?: string;
  employmentStatus?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  firstNameKh?: string;
  lastNameKh?: string;
  genderId?: number;
  dateFormat?: string;
  startDate?: string;
  postProbationDate?: string;
  resignDate?: string;
  contractType?: string;
  contractPeriodStartDate?: string;
  contractPeriodEndDate?: string;
  employmentType?: string;
  workingShiftId?: number;
  dob?: string;
  age?: number;
  placeOfBirthId?: number;
  nationality?: number;
  email?: string;
  maritalStatusId?: number;
  spouseId: number;
  spouseOccupation?: string;
  numberOfChildren?: number;
  addressHomeNumber?: string;
  addressStreetNumber?: string;
  addressVillageId?: number;
  addressProvinceId?: number;
  addressDistrictId?: number;
  addressCommuneId?: number;
  taxResponsible?: string;
  status?: string;
  userId?: number;
}

export interface UserId {
  userId: number;
}

export interface EmployeeDto {
  id: number;
  accountNo?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  phone: string;
  email: string;
  location?: string;
  outlet?: string;
  department?: string;
  position?: string;
  displayFullNameEn?: string;
  employeeId?: number;
}

export interface PositionLevelId {
  id: number;
}

export interface CompanyStructureComponentId {
  id: number;
}

export interface CompanyStructureComponentDto {
  id: number;
  name: string;
  type: string;
}

export interface PositionLevelDto {
  id: number;
  levelTitle: string;
  levelNumber: number;
}

export interface User {
  userId: number;
}

export interface EmployeeId {
  employeeId: number;
}

export interface EmployeeStatusParams {
  id: number;
  type?: string;
  status: string;
}

export interface EmployeeMovementParams {
  id: number;
  status: string;
}

export interface EmployeePositionDto {
  id: number;
  isDefaultPosition: boolean;
  companyStructureId: number;
  department: string;
  outlet: string;
  positionLevelId: number;
  levelTitle: string;
  levelNumber: number;
}

export interface EmployeeUpdateDto {
  requestUpdate: UpdateEmployeeInformationDto;
  updateBody: UpdateEmployeeInformationDto;
}
export interface CompanyStructureOutletId {
  id: number;
}

export interface CompanyStructureOutletDto {
  id: number;
}

export interface SendEmployeeId {
  id: number;
}

export interface CompanyStructure {
  id: number;
  ipAddress: string;
  lastRetrieveDate: string;
  port: number;
  name: string;
  fingerprintDeviceId: number;
}

export interface SendEmployeeDto {
  id: number;
  email: string;
  firstNameEn: string;
  lastNameEn: string;
  dob: Date;
  gender: string;
  startDate: Date;
  maritalStatus: string;
  workingShiftId: WorkingShift;
  positionLevelId: number;
  createdBy: number;
  userId: number;
  location?: string;
  outlet?: string;
  department?: string;
  position?: string;
  displayFullNameEn?: string;
}

export interface WorkingShift {
  id: number;
  name: string;
}

export interface VerifyStatusDto {
  response: string;
}

export interface AttendanceRecord {
  fingerPrintId: string;
  scanTime: Date;
  companyStructureOutletId: number;
}

export interface WorkingSchedulerDto {
  id: number;
  deletedAt: null | Date;
  scheduleDate: string;
  startWorkingTime: string;
  endWorkingTime: string;
  employeeId: EmployeeDto;
}

export interface JobSchedulerLogRequest {
  startType: string;
  jobSchedulerLogName: string;
}

export interface JobSchedulerLogNameRequest {
  jobSchedulerLogName: string;
}

export interface IUpdateFingerprintDevice {
  id: number;
  lastRetrievedDate: Date;
  lastRetrievedStatus: any;
}

export interface NotifyStatus {
  status: string;
}

export interface CompanyInformation {
  nameEn: string;
  nameKh: string;
}

export interface IChangeServerDate {
  date: string;
}

export const EMPLOYEE_PACKAGE_NAME = 'Employee';
export interface EmployeeServiceClient {
  companyInformation(empty: Empty): Observable<CompanyInformation>;

  findByEmail(request: EmployeeEmail): Observable<EmployeeDto>;

  findByPhone(request: Phone): Observable<EmployeeDto>;

  updateEmployeeGrpc(request: EmployeeUpdate): Observable<EmployeeDto>;

  getCompanyStructureComponentById(
    param: CompanyStructureComponentId
  ): Observable<CompanyStructureComponentDto>;

  getPositionLevelById(
    positionLevelId: PositionLevelId
  ): Observable<{ data: PositionLevelDto }>;

  getEmployeeByUserId(request: User): Observable<EmployeeDto>;

  getEmployeeByEntityId(request: EntityId): Observable<EmployeeDto>;

  getEmployeePositionByEmployeeId(
    request: EmployeeId
  ): Observable<EmployeePositionDto>;

  updateEmployeeInformation(
    employeeUpdate: EmployeeUpdateDto
  ): Observable<EmployeeId>;

  updateEmployeeStatus(param: EmployeeStatusParams): Observable<EmployeeId>;

  getCompanyStructureOutletId(
    companyStructureOutletId: CompanyStructureOutletId
  ): Observable<{ data: CompanyStructureOutletDto }>;

  getEmployeeId(employeeId: EmployeeId): Observable<{ data: SendEmployeeDto }>;

  getEmployeeOfCurrentUser(userId: UserId): Observable<CurrentEmployeeDto>;

  getWorkingScheduler(
    empty: Empty
  ): Observable<{ data: WorkingSchedulerDto[] }>;

  getCompanyStructureOutlet(
    empty: Empty
  ): Observable<{ data: CompanyStructure[] }>;

  createAttendanceRecord(attendances: {
    data: AttendanceRecord[];
  }): Observable<{ data: number }>;

  getAllEmployeeMpath(empty: Empty): Observable<{ data: IEmployeeMpath[] }>;

  startLog(jobSchedulerLogRequest: JobSchedulerLogRequest): Observable<void>;

  endLog(
    jobSchedulerLogNameRequest: JobSchedulerLogNameRequest
  ): Observable<void>;

  failedLog(
    jobSchedulerLogNameRequest: JobSchedulerLogNameRequest
  ): Observable<void>;

  updateFingerprintDeviceStatus(
    updateFingerprintDeviceDto: IUpdateFingerprintDevice
  ): Observable<void>;

  notifyApplicationRunning(empty: Empty): Observable<NotifyStatus>;

  setDateOnServer(setDateServerDto: IChangeServerDate): Observable<void>;
}

export interface EmployeeServiceController {
  companyInformation(
    empty: Empty
  ):
    | Promise<CompanyInformation>
    | Observable<CompanyInformation>
    | CompanyInformation;

  findByEmail(
    request: EmployeeEmail
  ): Promise<EmployeeDto> | Observable<EmployeeDto> | EmployeeDto;

  findByPhone(
    request: Phone
  ): Promise<EmployeeDto> | Observable<EmployeeDto> | EmployeeDto;

  updateEmployeeGrpc(request: EmployeeUpdate): Promise<EmployeeDto>;

  getPositionLevelById(
    positionLevelId: PositionLevelId
  ):
    | Promise<{ data: PositionLevelDto }>
    | Observable<{ data: PositionLevelDto }>
    | { data: PositionLevelDto };

  getEmployeeByUserId(request: User): Promise<EmployeeDto>;

  getEmployeePositionByEmployeeId(
    request: EmployeeId
  ): Promise<EmployeePositionDto>;

  getCompanyStructureComponentById(
    param: CompanyStructureComponentId
  ): Promise<CompanyStructureComponentDto>;

  getCompanyStructureOutletId(
    companyStructureOutletId: CompanyStructureOutletId
  ):
    | Promise<{ data: CompanyStructureOutletDto }>
    | Observable<{ data: CompanyStructureOutletDto }>
    | { data: CompanyStructureOutletDto };

  getEmployeeId(
    employeeId: EmployeeId
  ):
    | Promise<{ data: SendEmployeeDto }>
    | Observable<{ data: SendEmployeeDto }>
    | { data: SendEmployeeDto };

  getEmployeeOfCurrentUser(userId: UserId): Promise<CurrentEmployeeDto>;
  getCompanyStructureOutlet(
    empty: Empty
  ): Promise<{ data: CompanyStructure[] }>;
  createAttendanceRecord(attendances: {
    data: AttendanceRecord[];
  }): Promise<{ data: number }>;

  getAllEmployeeMpath(empty: Empty): Promise<{ data: IEmployeeMpath[] }>;

  startLog(jobSchedulerLogRequest: JobSchedulerLogRequest): Promise<void>;

  endLog(jobSchedulerLogNameRequest: JobSchedulerLogNameRequest): Promise<void>;

  failedLog(
    jobSchedulerLogNameRequest: JobSchedulerLogNameRequest
  ): Promise<void>;

  updateFingerprintDeviceStatus(
    updateFingerprintDeviceDto: IUpdateFingerprintDevice
  ): Promise<void>;

  notifyApplicationRunning(empty: Empty): NotifyStatus;

  setDateOnServer(setDateServerDto: IChangeServerDate): void;
}

export function EmployeeServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'findByEmail',
      'updateEmployeeGrpc',
      'getPositionLevelId',
      'getEmployeeByUserId',
      'getEmployeePositionByEmployeeId',
      'updateEmployeeInformation',
      'findByPhone',
      'getPositionLevelId',
      'getCompanyStructureOutletId',
      'getEmployeeId',
      'getCompanyStructureComponentById',
      'getEmployeeByEntityId',
      'getEmployeeOfCurrentUser',
      'getCompanyStructureOutlet',
      'createGrpcAttendanceRecord',
      'getAllEmployeeMpath',
      'startLog',
      'endLog',
      'failedLog',
      'updateFingerprintDeviceStatus',
      'notifyApplicationRunning',
      'companyInformation',
      'setDateOnServer'
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('EmployeeService', method)(
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
      GrpcStreamMethod('EmployeeService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const EMPLOYEE_SERVICE_NAME = 'EmployeeService';
