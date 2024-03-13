import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type
} from '@nestjs/common';
import { Request } from 'express';
import { validatePermission } from '../../shared-resources/gurads/permission-guard.service';
import { UserService } from '../../user/user.service';
import { accessibleUrls } from '../../shared-resources/ts/constants/accessibleUrls';
import { ResourceForbiddenException } from '../../shared-resources/exception/forbidden.exception';

export const PermissionGuard = (permissionCode: string): Type<CanActivate> => {
  @Injectable()
  class PermissionGuardMixin implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const Request: Request = context.switchToHttp().getRequest();
      const id = Request.get('x-consumer-custom-id');
      const userPermission = await this.userService.grpcGetUserPermission(
        Number(id)
      );

      const currentUser: any = (await this.userService.getUserById(Number(id)))
        .data;

      if (currentUser.resetPassword) {
        if (!accessibleUrls.includes(Request.route.path)) {
          throw new ResourceForbiddenException(`You have to reset password`);
        }
      }

      return validatePermission(permissionCode, userPermission.permission);
    }
  }

  return mixin(PermissionGuardMixin);
};
