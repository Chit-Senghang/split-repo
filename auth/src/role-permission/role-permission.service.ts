import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { CacheService } from '../cache/cache.service';
import { Permission } from '../permission/entities/permission.entity';
import { RolePermission } from '../role/entities/role-permission.entity';
import { Role } from '../role/entities/role.entity';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { roleConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';

@Injectable()
export class RolePermissionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService
  ) {}

  async attachPermissionToRole(roleId: number, permissionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: roleId },
        relations: { userRole: { user: true } }
      });

      if (!role) {
        throw new ResourceNotFoundException('role', `id ${roleId}`);
      }
      const permission = await queryRunner.manager.findOneBy(Permission, {
        id: permissionId
      });
      if (!permission) {
        throw new ResourceNotFoundException('permission', `id ${permission}`);
      }

      const rolePermission = queryRunner.manager.create(RolePermission, {
        role,
        permission
      });

      await queryRunner.manager.save(rolePermission);

      for (const userRole of role.userRole) {
        await this.cacheService.deleteUserKey(userRole.user.id);
      }

      await queryRunner.commitTransaction();
      return {
        data: {
          id: rolePermission.id
        }
      };
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(exception, roleConstraint);
    } finally {
      await queryRunner.release();
    }
  }

  async removePermissionFromRole(roleId: number, permissionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const role = await queryRunner.manager.findOne(Role, {
        where: { id: roleId },
        relations: { userRole: { user: true } }
      });

      if (!role) {
        throw new ResourceNotFoundException('role', `id ${roleId}`);
      }
      const permission = await queryRunner.manager.findOneBy(Permission, {
        id: permissionId
      });
      if (!permission) {
        throw new ResourceNotFoundException('permission', `id ${permission}`);
      }
      const result = await queryRunner.manager.delete(RolePermission, {
        role,
        permission
      });

      if (result.affected === 0) {
        throw new ResourceNotFoundException('role-permission', `id`);
      }
      for (const userRole of role.userRole) {
        await this.cacheService.deleteUserKey(userRole.user.id);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
