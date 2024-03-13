import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { Role } from '../role/entities/role.entity';
import { UserService } from '../user/user.service';
import { KongJwtService } from '../authentication/kong-jwt.service';
import { AuditLoggingService } from './audit-logging.service';
import { AuditLoggingController } from './audit-logging.controller';
import { AuditLog } from './entities/audit-logging.entity';

@Module({
  controllers: [AuditLoggingController],
  providers: [AuditLoggingService, UserService, KongJwtService],
  imports: [TypeOrmModule.forFeature([AuditLog, User, UserRole, Role])],
  exports: [AuditLoggingService]
})
export class AuditLoggingModule {}
