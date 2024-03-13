import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { instanceToPlain } from 'class-transformer';
import { GlobalConfigurationNameEnum } from '../shared-resources/common/enum/global-configuration-name.enum';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { Role } from '../role/entities/role.entity';
import { CacheService } from '../cache/cache.service';
import { KongJwtService } from '../authentication/kong-jwt.service';
import { AuthenticationProto } from '../shared-resources/proto';
import { GrpcService } from '../grpc/grpc.service';
import { CurrentEmployeeDto } from '../shared-resources/proto/employee/employee.pb';
import { GlobalConfigurationService } from '../global-configuration/global-configuration.service';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { userConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user-role.entity';
import { User, userSearchableColumns } from './entities/user.entity';
import { UserPaginationQueryDto } from './dto/pagination.dto';
import { UserConsumer } from './entities/user-consumer.entity';

@Injectable()
export class UserService {
  private readonly USER = 'user';

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly kongServiceJwt: KongJwtService,
    private readonly grpcService: GrpcService,
    private readonly globalConfigurationService: GlobalConfigurationService
  ) {}

  async grpcGetUser(id: number): Promise<AuthenticationProto.User> {
    const userCache = await this.cacheService.getUserAudit(id);

    if (userCache) {
      return userCache;
    }

    const user = await this.userRepo.findOne({
      where: {
        id: id
      }
    });
    if (!user) {
      throw new RpcException({ message: 'user not found', code: 5 });
    }

    const result = {
      username: user.username,
      id: user.id,
      email: user.email,
      phone: user.phone,
      resetPassword: user.resetPassword,
      isSelfService: user.isSelfService
    };

    await this.cacheService.setUserAudit(id, result);
    return result;
  }

  async grpcGetUserPermission(id: number) {
    const permission = await this.cacheService.getUserPermission(id);
    return { permission };
  }

  async grpcRemoveUser(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      const user = await queryRunner.manager.findOne(User, {
        where: { id },
        loadRelationIds: true
      });

      if (!user) {
        throw new ResourceNotFoundException('user', `id ${id}`);
      }

      await queryRunner.manager.delete(UserRole, user);
      await queryRunner.manager.delete(UserConsumer, user);
      await queryRunner.manager.delete(User, user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    let consumerId: string;
    try {
      await queryRunner.startTransaction();
      const user = queryRunner.manager.create(User, {
        ...createUserDto,
        phoneVerified: true,
        emailVerified: true,
        isSelfService: createUserDto.isSelfService
          ? createUserDto.isSelfService
          : false,
        resetPassword: createUserDto.resetPassword
          ? createUserDto.resetPassword
          : false
      });

      const strongPassConfig =
        await this.globalConfigurationService.findOneByName(
          GlobalConfigurationNameEnum.ENABLE_STRONG_PASSWORD
        );
      if (strongPassConfig.isEnable) {
        const strongPassRegex = new RegExp(strongPassConfig.value);
        if (strongPassRegex && !strongPassRegex.test(createUserDto.password)) {
          throw new ResourceBadRequestException(
            'Password',
            strongPassConfig.description
          );
        }
      }

      const salt = await bcrypt.genSaltSync(Number(process.env.PASSWORD_SALT));
      user.password = await bcrypt.hash(user.password, salt);
      await queryRunner.manager.save(user);

      const roles = await queryRunner.manager.findBy(Role, {
        id: In(createUserDto.roles)
      });

      const roleList = roles.map((role) => {
        return queryRunner.manager.create(UserRole, { user, role });
      });
      await queryRunner.manager.save(roleList);

      const data = await this.kongServiceJwt.createConsumer(
        createUserDto.username,
        String(user.id)
      );
      consumerId = data.id;
      const userConsumer = queryRunner.manager.create(UserConsumer, {
        user,
        consumerId
      });
      await queryRunner.manager.save(userConsumer);
      await queryRunner.commitTransaction();
      return {
        data: {
          id: user.id,
          consumerId: consumerId
        }
      };
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      await this.kongServiceJwt.deleteConsumer(consumerId);
      handleResourceConflictException(exception, userConstraint);
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        const salt = await bcrypt.genSaltSync(
          Number(process.env.PASSWORD_SALT)
        );
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          salt
        );
      }

      const user = await this.userRepo.findOne({
        where: { id },
        relations: { userRole: true }
      });
      if (!user) {
        throw new ResourceNotFoundException('user', `id ${id}`);
      }

      let roles: Role[];
      if (updateUserDto.roles) {
        roles = await Promise.all(
          updateUserDto.roles.map(async (roleId: number) => {
            const role = await this.roleRepo.findOneBy({ id: roleId });
            if (!role) {
              throw new ResourceNotFoundException('role', `id ${roleId}`);
            }
            return role;
          })
        );
      }

      if (roles) {
        if (user.userRole.length > 0) {
          await Promise.all(
            user.userRole.map(async (userRole: UserRole) => {
              await this.userRoleRepo.delete(userRole.id);
            })
          );
        }
        await Promise.all(
          roles.map(async (role: Role) => {
            delete user.userRole;
            const roleList = this.userRoleRepo.create({
              user,
              role
            });
            await this.userRoleRepo.save(roleList);
          })
        );
      }

      const updatedUser = Object.assign(user, {
        ...updateUserDto,
        email: updateUserDto.email ?? null
      });
      await this.userRepo.save(updatedUser);
      await this.cacheService.deleteUserKey(id);
      return {
        data: {
          id
        }
      };
    } catch (exception) {
      handleResourceConflictException(exception, userConstraint);
    }
  }

  async addUserRole(id: number, roleId: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: { userRole: { role: true } }
      });

      if (!user) {
        throw new ResourceNotFoundException('user', `id ${id}`);
      }

      if (user.userRole.some((userRole) => userRole.id === roleId)) {
        throw new ResourceConflictException(
          'user,role',
          `user already has role id ${roleId}`
        );
      }

      const role = await this.roleRepo.findOneBy({ id: roleId });

      if (!role) {
        throw new ResourceNotFoundException('role', `id ${roleId}`);
      }

      const userRole = this.userRoleRepo.create({ role, user });
      await this.userRoleRepo.save(userRole);
      await this.cacheService.deleteUserKey(id);

      return { id };
    } catch (exception) {
      handleResourceConflictException(exception, userConstraint);
    }
  }

  async removeUserRole(id: number, roleId: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: {
        userRole: { role: true }
      }
    });

    if (!user) {
      throw new ResourceNotFoundException('user', `id ${id}`);
    }

    if (!user.userRole.some((u) => u.role.id === roleId)) {
      throw new ResourceNotFoundException('role', `id ${roleId}`);
    }

    if (user.userRole.length === 1) {
      throw new ResourceBadRequestException(
        'user,role',
        'can not delete user with only one role'
      );
    }

    await this.userRoleRepo.delete({ user: { id }, role: { id: roleId } });
    await this.cacheService.deleteUserKey(id);
  }

  async exportFile(
    pagination: UserPaginationQueryDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getAllUser(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.USER,
      exportFileDto,
      data
    );
  }

  async getAllUser(pagination: UserPaginationQueryDto) {
    return GetPagination(this.userRepo, pagination, userSearchableColumns, {
      where: {
        userRole: {
          role: {
            id: pagination.roleId
          }
        },
        isSelfService: pagination.isSelfService
      },
      relation: { userRole: { role: true } }
    });
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { userRole: { role: true } }
    });

    if (!user) {
      throw new ResourceNotFoundException('user', `id ${id}`);
    }

    return {
      data: instanceToPlain(user)
    };
  }

  async getCurrentUser(id: number) {
    const user = await this.userRepo.findOneOrFail({
      where: { id },
      relations: ['userRole.role.rolePermission.permission']
    });
    let employee: CurrentEmployeeDto = null;
    if (user.isSelfService) {
      employee = await this.grpcService.getEmployeeOfCurrentUser(user.id);
    }

    delete user.password;

    return {
      data: instanceToPlain({ ...user, employee })
    };
  }

  async deleteUser(param: AuthenticationProto.userParams): Promise<void> {
    const user = await this.userRepo.findOne({
      withDeleted: true,
      where: { id: param.userId },
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
    if (!user) {
      throw new ResourceNotFoundException(this.USER, param.userId);
    }
    await this.kongServiceJwt.deleteConsumer(user.userConsumer.consumerId);
    if (param.disableUser) {
      await this.userRepo.save(Object.assign(user, { isActive: false }));
      return;
    }
    await this.userRepo.delete(param.userId);
  }

  async getRoleByRoleName(
    roleName: string
  ): Promise<AuthenticationProto.roleDto> {
    const role = await this.roleRepo.findOneBy({
      name: roleName
    });

    if (!role) {
      throw new RpcException({
        message: `Resource of role with name ${roleName} not found`,
        code: 5
      });
    }
    return {
      id: role.id,
      name: role.name
    };
  }
}
