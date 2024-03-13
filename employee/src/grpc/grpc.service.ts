import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { instanceToPlain } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
import { AuditBaseEntity } from '../shared-resources/entity/audit-base.entity';
import { AuthenticationProto, SchedulerProto } from '../shared-resources/proto';

@Injectable()
export class GrpcService implements OnModuleInit {
  constructor(
    @Inject(AuthenticationProto.AUTHENTICATION_PACKAGE_NAME)
    private client?: ClientGrpc,
    @Inject(SchedulerProto.SCHEDULER_PACKAGE_NAME)
    private clientScheduler?: ClientGrpc
  ) {}

  private authenticationService: AuthenticationProto.AuthenticationServiceClient;

  private schedulerService: SchedulerProto.SchedulerServiceClient;

  onModuleInit() {
    this.authenticationService =
      this.client.getService<AuthenticationProto.AuthenticationServiceClient>(
        AuthenticationProto.AUTHENTICATION_SERVICE_NAME
      );
    this.schedulerService =
      this.clientScheduler.getService<SchedulerProto.SchedulerServiceClient>(
        SchedulerProto.SCHEDULER_SERVICE_NAME
      );
  }

  async updateEmployeeMpath(userId: number) {
    const result = this.authenticationService.updateEmployeeMpath({ userId });
    return await lastValueFrom(result);
  }

  async generateOtp(phone: string, email?: string) {
    const otp = this.authenticationService.generateOtp({ phone, email });
    return await lastValueFrom(otp);
  }

  async deleteUserById(param: AuthenticationProto.userParams) {
    const user = this.authenticationService.deleteUserById({
      ...param
    });
    return await lastValueFrom(user);
  }

  async generateToken(employeeId: number, userId: number) {
    const token = this.authenticationService.generateToken({
      employeeId,
      userId
    });
    return await lastValueFrom(token);
  }

  async getRoleByRoleName(name: string) {
    const role = this.authenticationService.getRoleByRoleName({ name });
    return await lastValueFrom(role);
  }

  async deleteStatusTracking(params: AuthenticationProto.statusTracking) {
    const statusTracking =
      this.authenticationService.deleteApprovalStatusTracking(params);
    return await lastValueFrom(statusTracking);
  }

  async createApprovalStatusTracking(
    createApprovalStatusTrackingDto: AuthenticationProto.approvalStatusTrackingDto
  ) {
    const approvalStatusTracking =
      this.authenticationService.createApprovalStatusTracking(
        createApprovalStatusTrackingDto
      );
    return await lastValueFrom(approvalStatusTracking);
  }

  async getRequestApprovalWorkflow(params: AuthenticationProto.params) {
    const requestApprovalWorkflow =
      this.authenticationService.getApprovalWorkflow(params);
    return await lastValueFrom(requestApprovalWorkflow);
  }

  async getWorkflowType(type: AuthenticationProto.workflowTypeName) {
    const workflowType = this.authenticationService.getWorkflowType(type);
    return await lastValueFrom(workflowType);
  }

  async createAuditLogging(
    createAuditLoggingDto: AuthenticationProto.createAuditLoggingDto
  ) {
    const auditLog = this.authenticationService.createAuditLogging(
      createAuditLoggingDto
    );
    return await lastValueFrom(auditLog);
  }

  getTemplates() {
    return this.authenticationService.getReasonTemplates();
  }

  async getOneReasonTemplate(id: number) {
    return await this.authenticationService
      .getOneReasonTemplate({
        id: id
      })
      .toPromise();
  }

  async removeUser(id: number) {
    return await this.authenticationService
      .deleteUser({ userId: id })
      .toPromise();
  }

  async getGlobalConfigurationByName(
    configuration: AuthenticationProto.globalConfigurationName
  ) {
    const globalConfiguration =
      this.authenticationService.getGlobalConfigurationByName(configuration);
    return await lastValueFrom(globalConfiguration);
  }

  async createUser(request: AuthenticationProto.createUser) {
    return await this.authenticationService.createNewUser(request).toPromise();
  }

  async getUserPermission(id: number) {
    const permission = this.authenticationService.getUserPermission({
      userId: id
    });
    return await lastValueFrom(permission);
  }

  async getUserById(id: number) {
    const user = this.authenticationService.getUser({ userId: id });
    return lastValueFrom(user);
  }

  async attachAuditData(auditEntity: AuditBaseEntity) {
    const { createdBy, updatedBy, ...data } = auditEntity;
    let createdByUser: AuthenticationProto.User,
      updatedByUser: AuthenticationProto.User;
    if (createdBy) {
      createdByUser = await this.authenticationService
        .getUser({
          userId: auditEntity.createdBy
        })
        .toPromise();
    }

    if (updatedBy) {
      updatedByUser = await this.authenticationService
        .getUser({
          userId: auditEntity.updatedBy
        })
        .toPromise();
    }
    return {
      ...instanceToPlain(data),
      createdBy: createdByUser ? { ...createdByUser } : null,
      updateBy: updatedByUser ? { ...updatedByUser } : null
    };
  }

  async attachAuditToListData(audit: AuditBaseEntity[]) {
    const respData = [];

    for (const result of audit) {
      respData.push(await this.attachAuditData(result));
    }
    return respData;
  }

  async handleFingerPrint() {
    const fingerPrint = this.schedulerService.handleFingerPrint({});
    return await lastValueFrom(fingerPrint);
  }
}
