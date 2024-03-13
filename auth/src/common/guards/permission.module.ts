import { Module } from '@nestjs/common';
import { PermissionService } from '../../permission/permission.service';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [UserModule],
  providers: [PermissionService],
  exports: [PermissionService]
})
export class PermissionGuardModule {}
