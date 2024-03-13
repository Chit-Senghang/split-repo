import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';

@Module({
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  imports: [UserModule]
})
export class RolePermissionModule {}
