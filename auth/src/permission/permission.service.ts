import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>
  ) {}

  async getAllRolePermission() {
    const rolePermission = await this.permissionRepo.manager
      .getTreeRepository(Permission)
      .findTrees();
    return {
      data: instanceToPlain(rolePermission)
    };
  }
}
