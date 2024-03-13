import { execSync } from 'child_process';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmployeeProto } from '../shared-resources/proto';
import { CompanyStructureService } from '../company-structure/company-structure.service';
import { EmployeePositionService } from '../employee-position/employee-position.service';
import { EmployeeService } from '../employee/employee.service';
import { PositionLevelService } from '../position-level/position-level.service';
import { CompanyStructureComponentService } from '../company-structure/company-structure-component/company-structure-component.service';
import { EmployeeWorkingScheduleService } from '../employee-working-schedule/employee-working-schedule.service';
import { AttendanceRecordService } from '../attendance/attendance-record/attendance-record.service';
import { FingerPrintDeviceService } from '../finger-print-device/finger-print-device.service';
import { Empty } from '../shared-resources/proto/google/protobuf/empty.pb';
import {
  IChangeServerDate,
  NotifyStatus
} from '../shared-resources/proto/employee/employee.pb';
import { CompanyInformationService } from './../company-information/company-information.service';
import { JobSchedulerLogService } from './../job-scheduler-log/job-scheduler-log-service';

@Controller('self-grpc')
export class SelfGrpcController
  implements EmployeeProto.EmployeeServiceController
{
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly positionLevelService: PositionLevelService,
    private readonly employeePositionService: EmployeePositionService,
    private readonly companyStructureService: CompanyStructureService,
    private readonly companyStructureComponentService: CompanyStructureComponentService,
    private readonly workingSchedulerService: EmployeeWorkingScheduleService,
    private readonly attendanceRecordService: AttendanceRecordService,
    private readonly jobSchedulerLogService: JobSchedulerLogService,
    private readonly fingerprintDeviceService: FingerPrintDeviceService,
    private readonly companyInformationService: CompanyInformationService
  ) {}

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'setDateOnServer')
  async setDateOnServer(setDateDto: IChangeServerDate) {
    try {
      execSync(`date "${setDateDto.date}"`);
      Logger.log(`System date changed to ${setDateDto.date}`);
    } catch (error) {
      Logger.error('Error changing system date:', error.message);
    }
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'companyInformation')
  async companyInformation() {
    return await this.companyInformationService.findOne();
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'notifyApplicationRunning')
  notifyApplicationRunning(empty: Empty): NotifyStatus {
    empty;
    return { status: 'OK' };
  }

  @GrpcMethod(
    EmployeeProto.EMPLOYEE_SERVICE_NAME,
    'updateFingerprintDeviceStatus'
  )
  async updateFingerprintDeviceStatus(
    updateFingerprintDeviceDto: EmployeeProto.IUpdateFingerprintDevice
  ): Promise<void> {
    await this.fingerprintDeviceService.grpcUpdateFingerprintDeviceStatus(
      updateFingerprintDeviceDto
    );
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'startLog')
  async startLog(
    jobSchedulerLog: EmployeeProto.JobSchedulerLogRequest
  ): Promise<void> {
    await this.jobSchedulerLogService.startLog(jobSchedulerLog);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'endLog')
  async endLog(
    jobSchedulerLogName: EmployeeProto.JobSchedulerLogRequest
  ): Promise<void> {
    await this.jobSchedulerLogService.endLog(jobSchedulerLogName);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'failedLog')
  async failedLog(
    jobSchedulerLogName: EmployeeProto.JobSchedulerLogRequest
  ): Promise<void> {
    await this.jobSchedulerLogService.failedLog(jobSchedulerLogName);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getAllEmployeeMpath')
  async getAllEmployeeMpath(): Promise<{
    data: EmployeeProto.IEmployeeMpath[];
  }> {
    return await this.employeeService.GrpcGetAllEmployeeMpath();
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getEmployeeOfCurrentUser')
  async getEmployeeOfCurrentUser(
    param: EmployeeProto.UserId
  ): Promise<EmployeeProto.CurrentEmployeeDto> {
    return await this.employeeService.grpcGetEmployeeForCurrentUser(
      param.userId
    );
  }

  @GrpcMethod(
    EmployeeProto.EMPLOYEE_SERVICE_NAME,
    'getCompanyStructureComponentById'
  )
  async getCompanyStructureComponentById(
    param: EmployeeProto.CompanyStructureComponentId
  ): Promise<EmployeeProto.CompanyStructureComponentDto> {
    return this.companyStructureComponentService.grpcFindOne(param);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getEmployeeId')
  async getEmployeeId(
    employeeId: EmployeeProto.EmployeeId
  ): Promise<{ data: EmployeeProto.SendEmployeeDto }> {
    return await this.employeeService.grpcGetEmployeeById(employeeId);
  }

  @GrpcMethod(
    EmployeeProto.EMPLOYEE_SERVICE_NAME,
    'getCompanyStructureOutletId'
  )
  getCompanyStructureOutletId(
    companyStructureOutletId: EmployeeProto.CompanyStructureOutletId
  ): Promise<{ data: EmployeeProto.CompanyStructureOutletDto }> {
    return this.companyStructureService.grpcGetCompanyStructureOutletById(
      companyStructureOutletId
    );
  }

  @GrpcMethod(
    EmployeeProto.EMPLOYEE_SERVICE_NAME,
    'getEmployeePositionByEmployeeId'
  )
  getEmployeePositionByEmployeeId(
    request: EmployeeProto.EmployeeId
  ): Promise<EmployeeProto.EmployeePositionDto> {
    return this.employeePositionService.grpcGetEmployeePositionByEmployeeId(
      request
    );
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getEmployeeByUserId')
  getEmployeeByUserId(
    request: EmployeeProto.User
  ): Promise<EmployeeProto.EmployeeDto> {
    return this.employeeService.grpcGetEmployeeByUserId(request);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'findByEmail')
  findByEmail(
    request: EmployeeProto.EmployeeEmail
  ): Promise<EmployeeProto.EmployeeDto> {
    return this.employeeService.findOneByEmailGrpc(request);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'findByPhone')
  findByPhone(
    request: EmployeeProto.Phone
  ): Promise<EmployeeProto.EmployeeDto> {
    return this.employeeService.findOneByPhoneGrpc(request);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'updateEmployeeGrpc')
  async updateEmployeeGrpc(
    request: EmployeeProto.EmployeeUpdate
  ): Promise<EmployeeProto.EmployeeDto> {
    return await this.employeeService.updateEmployeeGrpc(request);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getPositionLevelById')
  getPositionLevelById(
    positionLevelId: EmployeeProto.PositionLevelId
  ): Promise<{ data: EmployeeProto.PositionLevelDto }> {
    return this.positionLevelService.grpcGetPositionLevelById(positionLevelId);
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getWorkingScheduler')
  async getWorkingScheduler(): Promise<{
    data: EmployeeProto.WorkingSchedulerDto[];
  }> {
    return await this.workingSchedulerService.getWorkingScheduleForToday();
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'getCompanyStructureOutlet')
  async getCompanyStructureOutlet(): Promise<{
    data: EmployeeProto.CompanyStructure[];
  }> {
    return await this.companyStructureService.grpcGetCompanyStructureOutlet();
  }

  @GrpcMethod(EmployeeProto.EMPLOYEE_SERVICE_NAME, 'createAttendanceRecord')
  async createAttendanceRecord(attendance: {
    data: EmployeeProto.AttendanceRecord[];
  }): Promise<{ data: number }> {
    return await this.attendanceRecordService.grpcCreateAttendanceRecord(
      attendance
    );
  }
}
