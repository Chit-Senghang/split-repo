import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { instanceToPlain } from 'class-transformer';
import {
  CURRENT_USER_KEY,
  USER_MPATH_PREFIX
} from '../shared-resources/cache/cache-constants';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { User } from '../user/entities/user.entity';
import { AuthenticationProto } from '../shared-resources/proto';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly permissionPrefix = 'permission';

  private readonly userAuditPrefix = 'userAudit';

  async deleteUserKey(id: number) {
    const userPermissionKey = this.permissionPrefix + id;
    const userAuditKey = this.userAuditPrefix + id;
    await this.cacheManager.del(userAuditKey);
    await this.cacheManager.del(userPermissionKey);
  }

  async setUserPermission(id: number, permissionList: string[]) {
    const key = this.permissionPrefix + id;
    await this.cacheManager.set(key, permissionList);
  }

  async deleteUserMpath(id: number): Promise<void> {
    const key = USER_MPATH_PREFIX + String(id);
    await this.cacheManager.del(key);
  }

  async setUserMpath(id: number, employeeIds: number[]): Promise<void> {
    const key = USER_MPATH_PREFIX + String(id);
    await this.cacheManager.set(key, employeeIds);
  }

  async getUserMpath(id: number) {
    const key = USER_MPATH_PREFIX + String(id);
    const employeeIds = await this.cacheManager.get(key);
    return employeeIds;
  }

  async getUserPermission(userId: number): Promise<string[]> {
    const key = CURRENT_USER_KEY + userId;
    const data: User = await this.cacheManager.get(key);
    return data.userRole.flatMap((userRole) =>
      userRole.role.rolePermission.map(
        (permissions) => permissions.permission.name
      )
    );
  }

  async setUserAudit(id: number, data: AuthenticationProto.User) {
    const key = this.userAuditPrefix + id;
    await this.cacheManager.set(key, data);
  }

  async getUserAudit(id: number): Promise<AuthenticationProto.User> {
    const key = this.userAuditPrefix + id;
    return this.cacheManager.get(key);
  }

  async setCurrentUser(userId: number, user: User) {
    const key = CURRENT_USER_KEY + userId;
    const userData = instanceToPlain(user);
    await this.cacheManager.set(key, userData);
  }

  async getCurrentUser() {
    const userId = getCurrentUserFromContext();
    const key = CURRENT_USER_KEY + userId;
    return await this.cacheManager.get(key);
  }
}
