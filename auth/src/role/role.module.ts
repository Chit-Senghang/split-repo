import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../user/entities/user.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermission, Permission, User]),
    UserModule
  ],
  controllers: [RoleController],
  providers: [RoleService]
})
export class RoleModule {}
