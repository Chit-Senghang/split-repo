import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import {
  AttendanceProto,
  EmployeeProto,
  SchedulerProto
} from '../shared-resources/proto';
import { handleGrpcErrorException } from '../shared-resources/utils/handle-grpc-error-exception';

@Injectable()
export class GrpcService implements OnModuleInit {
  constructor(
    @Inject(EmployeeProto.EMPLOYEE_PACKAGE_NAME)
    private employeeClient: ClientGrpc,
    @Inject(AttendanceProto.ATTENDANCE_PACKAGE_NAME)
    private attendanceClient: ClientGrpc,
    @Inject(SchedulerProto.SCHEDULER_PACKAGE_NAME)
    private schedulerClient: ClientGrpc
  ) {}

  private employeeService: EmployeeProto.EmployeeServiceClient;

  private attendanceService: AttendanceProto.AttendanceServiceClient;

  private schedulerService: SchedulerProto.SchedulerServiceClient;

  async onModuleInit() {
    this.employeeService =
      this.employeeClient.getService<EmployeeProto.EmployeeServiceClient>(
        EmployeeProto.EMPLOYEE_SERVICE_NAME
      );
    this.attendanceService =
      this.attendanceClient.getService<AttendanceProto.AttendanceServiceClient>(
        AttendanceProto.ATTENDANCE_SERVICE_NAME
      );
    this.schedulerService =
      this.schedulerClient.getService<SchedulerProto.SchedulerServiceClient>(
        SchedulerProto.SCHEDULER_SERVICE_NAME
      );
  }

  async setDateOnEmployeeServer(date: string) {
    try {
      const employeeMpath: Observable<void> =
        this.employeeService.setDateOnServer({ date });
      return await lastValueFrom(employeeMpath);
    } catch (error) {
      handleGrpcErrorException(error);
    }
  }

  async checkSchedulerApplicationRunning() {
    try {
      const scheduler = this.schedulerService.notifyApplicationRunning({});
      return await lastValueFrom(scheduler);
    } catch (error) {
      return { status: 'NO' };
    }
  }

  async checkEmployeeApplicationRunning(): Promise<EmployeeProto.NotifyStatus> {
    try {
      const application = this.employeeService.notifyApplicationRunning({});
      return await lastValueFrom(application);
    } catch (error) {
      return { status: 'NO' };
    }
  }

  async getAllEmployeeMpath() {
    try {
      const employeeMpath = this.employeeService.getAllEmployeeMpath({});
      return await lastValueFrom(employeeMpath);
    } catch (error) {
      handleGrpcErrorException(error);
    }
  }

  async getEmployeeOfCurrentUser(userId: number) {
    const employee = this.employeeService.getEmployeeOfCurrentUser({ userId });
    return await lastValueFrom(employee);
  }

  async getAttendanceByEntityId(request: AttendanceProto.getAttendanceDto) {
    const attendance = this.attendanceService.getAttendanceByEntityId(request);
    return await lastValueFrom(attendance);
  }

  async getEmployeeByEntityId(request: EmployeeProto.EntityId) {
    const data = this.employeeService.getEmployeeByEntityId(request);
    return await lastValueFrom(data);
  }

  async getCompanyStructureComponentById(companyStructureComponentId: number) {
    const companyStructureComponent =
      this.employeeService.getCompanyStructureComponentById({
        id: companyStructureComponentId
      });
    return await lastValueFrom(companyStructureComponent);
  }

  async updateAttendanceRecordStatus(
    param: AttendanceProto.updateStatusParams
  ) {
    const borrowOrPayback =
      this.attendanceService.updateAttendanceStatus(param);
    return await lastValueFrom(borrowOrPayback);
  }

  async getEmployeeById(id: number) {
    const getEmployeeById = this.employeeService.getEmployeeId({
      employeeId: id
    });
    return await lastValueFrom(getEmployeeById);
  }

  async updateEmployeeStatus(params: EmployeeProto.EmployeeStatusParams) {
    const employeeWarning = this.employeeService.updateEmployeeStatus(params);
    return await lastValueFrom(employeeWarning);
  }

  async updateEmployeeMovementStatus(
    params: EmployeeProto.EmployeeStatusParams
  ) {
    const employeeMovement = this.employeeService.updateEmployeeStatus(params);
    return await lastValueFrom(employeeMovement);
  }

  async updateEmployeeInformation(
    updateEmployeeDto: EmployeeProto.EmployeeUpdateDto
  ) {
    const employee =
      this.employeeService.updateEmployeeInformation(updateEmployeeDto);
    return lastValueFrom(employee);
  }

  async getEmployeePositionByEmployeeId(employeeId: number) {
    const employeePosition =
      this.employeeService.getEmployeePositionByEmployeeId({
        employeeId: employeeId
      });
    return lastValueFrom(employeePosition);
  }

  async getEmployeeByUserId(userId: number) {
    const employee = this.employeeService.getEmployeeByUserId({
      userId: userId
    });
    return await lastValueFrom(employee);
  }

  async getPositionLevelById(id: number) {
    const positionLevel = this.employeeService.getPositionLevelById({ id });
    return await lastValueFrom(positionLevel);
  }

  async findOneByEmailGrpc(request: EmployeeProto.EmployeeEmail) {
    const email = this.employeeService.findByEmail({ email: request.email });
    return await lastValueFrom(email);
  }

  async findOneByPhoneGrpc(request: EmployeeProto.Phone) {
    const phoneNumber = this.employeeService.findByPhone(request);
    return await lastValueFrom(phoneNumber);
  }

  async updateEmployeeGrpc(request: EmployeeProto.EmployeeUpdate) {
    const employee = this.employeeService.updateEmployeeGrpc(request);
    return await lastValueFrom(employee);
  }
}
