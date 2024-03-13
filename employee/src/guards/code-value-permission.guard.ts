import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type
} from '@nestjs/common';
import { Request } from 'express';
import { GrpcService } from '../../../employee/src/grpc/grpc.service';
import { validatePermission } from '../shared-resources/gurads/permission-guard.service';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';

export const CodeValuePermissionGuard = (
  permissionCode: string
): Type<CanActivate> => {
  @Injectable()
  class PermissionGuardMixin implements CanActivate {
    constructor(private readonly grpcService: GrpcService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: Request = context.switchToHttp().getRequest();
      const id = request.get('x-consumer-custom-id');
      const userPermission = await this.grpcService.getUserPermission(
        Number(id)
      );

      const currentUser = await this.grpcService.getUserById(Number(id));
      if (currentUser.resetPassword) {
        throw new ResourceForbiddenException(`You have to reset password`);
      }

      // check permissions code-value
      const codeValuePermission: string =
        permissionCode + `_${request.query.code}`;

      return validatePermission(codeValuePermission, userPermission.permission);
    }
  }

  return mixin(PermissionGuardMixin);
};
