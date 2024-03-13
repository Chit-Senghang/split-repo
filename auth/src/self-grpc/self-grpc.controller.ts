import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { QueryFailedError } from 'typeorm';
import { AuthenticationProto } from '../shared-resources/proto';
import { Empty } from '../shared-resources/proto/google/protobuf/empty.pb';
import { AuditLoggingService } from '../audit-logging/audit-logging.service';
import { GlobalConfigurationService } from '../global-configuration/global-configuration.service';
import { UserService } from '../user/user.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { CacheService } from '../cache/cache.service';

@Controller('self-grpc')
export class SelfGrpcController
  implements AuthenticationProto.AuthenticationServiceController
{
  constructor(
    private readonly userService: UserService,
    private readonly auditLoggingService: AuditLoggingService,
    private readonly globalConfigurationService: GlobalConfigurationService,
    private readonly authenticationService: AuthenticationService,
    @Inject(CacheService) private readonly cacheService: CacheService
  ) {}

  @GrpcMethod(
    AuthenticationProto.AUTHENTICATION_SERVICE_NAME,
    'updateEmployeeMpath'
  )
  async updateEmployeeMpath(
    param: AuthenticationProto.userParams
  ): Promise<Empty> {
    const result = await this.cacheService.getUserMpath(param.userId);
    if (!result) {
      await this.authenticationService.setEmployeeMpath(param.userId);
      return;
    }
    await this.authenticationService.setEmployeeMpath(param.userId);
  }

  @GrpcMethod(AuthenticationProto.AUTHENTICATION_SERVICE_NAME, 'generateOtp')
  async generateOtp(
    otpDto: AuthenticationProto.generateOtpDto
  ): Promise<{ data: AuthenticationProto.generateOtpResponse }> {
    return await this.authenticationService.getOtpForVerify(otpDto);
  }

  @GrpcMethod(AuthenticationProto.AUTHENTICATION_SERVICE_NAME, 'deleteUserById')
  async deleteUserById(param: AuthenticationProto.userParams): Promise<Empty> {
    await this.userService.deleteUser(param);
    return {};
  }

  @GrpcMethod(AuthenticationProto.AUTHENTICATION_SERVICE_NAME, 'generateToken')
  async generateToken(
    param: AuthenticationProto.generateTokenDto
  ): Promise<AuthenticationProto.generateTokenResponse> {
    return await this.authenticationService.grpcGenerateJwtToken(
      param.employeeId,
      param.userId
    );
  }

  @GrpcMethod(
    AuthenticationProto.AUTHENTICATION_SERVICE_NAME,
    'getRoleByRoleName'
  )
  async getRoleByRoleName(
    param: AuthenticationProto.roleName
  ): Promise<AuthenticationProto.roleDto> {
    return await this.userService.getRoleByRoleName(param.name);
  }

  @GrpcMethod(
    AuthenticationProto.AUTHENTICATION_SERVICE_NAME,
    'getGlobalConfigurationByName'
  )
  async getGlobalConfigurationByName(
    name: AuthenticationProto.globalConfigurationName
  ): Promise<AuthenticationProto.globalConfigurationDto> {
    return await this.globalConfigurationService.grpcGlobalConfiguration(name);
  }

  @GrpcMethod(
    AuthenticationProto.AUTHENTICATION_SERVICE_NAME,
    'createAuditLogging'
  )
  async createAuditLogging(
    createAuditLogging: AuthenticationProto.createAuditLoggingDto
  ): Promise<AuthenticationProto.auditLoggingId> {
    return await this.auditLoggingService.createAuditLog(createAuditLogging);
  }

  @GrpcMethod(AuthenticationProto.AUTHENTICATION_SERVICE_NAME, 'deleteUser')
  async deleteUser(request: AuthenticationProto.userParams): Promise<void> {
    await this.userService.grpcRemoveUser(request.userId);
  }

  @GrpcMethod(AuthenticationProto.AUTHENTICATION_SERVICE_NAME, 'createNewUser')
  async createNewUser(request: AuthenticationProto.createUser) {
    try {
      const user = await this.userService.createUser(request);
      return { userId: user.data.id, consumerId: user.data.consumerId };
    } catch (error) {
      throw new RpcException({ message: (error as QueryFailedError).message });
    }
  }

  @GrpcMethod(
    AuthenticationProto.AUTHENTICATION_SERVICE_NAME,
    'createUserVerification'
  )
  createUserVerification(request: AuthenticationProto.userPhone) {
    request;
    return {
      userVerificationId: 1
    };
  }

  @GrpcMethod(AuthenticationProto.AUTHENTICATION_SERVICE_NAME, 'getUser')
  getUser(request: AuthenticationProto.userParams) {
    return this.userService.grpcGetUser(request.userId);
  }

  @GrpcMethod(
    AuthenticationProto.AUTHENTICATION_SERVICE_NAME,
    'getUserPermission'
  )
  getUserPermission(request: AuthenticationProto.userParams) {
    return this.userService.grpcGetUserPermission(request.userId);
  }
}
