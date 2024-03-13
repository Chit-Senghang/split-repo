import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { Permission } from '../permission/entities/permission.entity';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { CacheService } from '../cache/cache.service';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { User } from '../user/entities/user.entity';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { roleConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolePermission } from './entities/role-permission.entity';
import { PaginationQueryRoleDto } from './dto/pagination-query-role.dto';

@Injectable()
export class RoleService {
  private readonly PERMISSION = 'permission';

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    private readonly dataSource: DataSource,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async getAllRole(pagination: PaginationQueryRoleDto) {
    return GetPagination(this.roleRepository, pagination, ['name'], {
      select: {
        rolePermission: {
          id: true,
          permission: {
            id: true,
            name: true
          }
        }
      },
      relation: {
        rolePermission: {
          permission: true
        }
      }
    });
  }

  async exportFile(
    pagination: PaginationQueryRoleDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getAllRole(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.ROLE,
      exportFileDto,
      data
    );
  }

  async getSpecificRole(id: number, includePermission: boolean) {
    if (!includePermission) {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: {
          rolePermission: {
            permission: true
          }
        }
      });

      if (!role) {
        throw new ResourceNotFoundException('role', `id ${id}`);
      }
      return role;
    }
    const roleWithRolePermission = await this.roleRepository.findOne({
      where: { id },
      relations: {
        rolePermission: {
          permission: true
        }
      }
    });
    if (!roleWithRolePermission) {
      throw new ResourceNotFoundException('role', `id ${id}`);
    }

    const permission = [];

    for (const rolePermission of roleWithRolePermission.rolePermission) {
      permission.push(instanceToPlain(rolePermission));
    }
    return permission;
  }

  async createNewRole(createNewRole: CreateRoleDto): Promise<Role> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //* Check Permission
      for (const permissionId of createNewRole.permissionId) {
        const permission = await this.permissionRepo.findOne({
          where: {
            id: permissionId
          }
        });
        if (!permission) {
          throw new ResourceNotFoundException(this.PERMISSION, permissionId);
        }
      }

      let newRoleExists: Role = this.roleRepository.create({
        name: createNewRole.name,
        description: createNewRole.description
      });

      newRoleExists = await queryRunner.manager.save(newRoleExists);

      // * Insert role id to role permission
      for (const permission of createNewRole.permissionId) {
        const rolePermission = this.rolePermissionRepo.create({
          permission: {
            id: permission
          },
          role: {
            id: newRoleExists.id
          }
        });
        await queryRunner.manager.save(rolePermission);
      }
      await queryRunner.commitTransaction();
      return newRoleExists;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(exception, roleConstraint, createNewRole);
    } finally {
      await queryRunner.release();
    }
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const role = await queryRunner.manager.findOne(Role, {
        where: { id },
        relations: {
          userRole: { user: true },
          rolePermission: true
        }
      });
      if (!role) {
        throw new ResourceNotFoundException('role', `id ${id}`);
      }

      //ALLOW: user to update only permission and description when system defined = true
      this.checkSystemDefined(updateRoleDto, role);

      await queryRunner.manager.save(
        Object.assign(role, {
          name: updateRoleDto.name,
          description: updateRoleDto.description
        })
      );

      if (updateRoleDto.permissionId) {
        if (role.rolePermission.length > 0) {
          await queryRunner.manager.delete(RolePermission, role.rolePermission);
        }
        //* Check Permission
        for (const permissionId of updateRoleDto.permissionId) {
          const permission = await this.permissionRepo.findOne({
            where: {
              id: permissionId
            }
          });
          if (!permission) {
            throw new ResourceNotFoundException(this.PERMISSION, permissionId);
          }

          // * Insert role id to role permission
          const rolePermission = queryRunner.manager.create(RolePermission, {
            permission: {
              id: permissionId
            },
            role: {
              id: role.id
            }
          });
          await queryRunner.manager.save(rolePermission);
        }
      }

      await queryRunner.commitTransaction();
      const userId = getCurrentUserFromContext();
      await this.cacheService.deleteUserKey(userId);
      const user: User = await this.userRepo.findOne({
        where: { id: userId },
        relations: {
          userConsumer: true,
          userRole: {
            role: {
              rolePermission: {
                permission: true
              }
            }
          }
        }
      });
      await this.cacheService.setCurrentUser(user.id, user);
      return role;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(exception, roleConstraint, updateRoleDto);
    } finally {
      await queryRunner.release();
    }
  }

  // =================== [Private block] ===================
  private checkSystemDefined(updateRoleDto: UpdateRoleDto, role: Role): void {
    //CHECK: this way because we use PUT method
    if (role.isSystemDefined && updateRoleDto.name !== role.name) {
      throw new ResourceBadRequestException(
        'name',
        'You cannot change name because of system defined.'
      );
    }
  }
}
