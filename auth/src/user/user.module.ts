import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule } from '../cache/cache.module';
import { Permission } from '../permission/entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { AuthenticationModule } from '../authentication/authentication.module';
import { GlobalConfigurationModule } from '../global-configuration/global-configuration.module';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserConsumer } from './entities/user-consumer.entity';
import { UserRole } from './entities/user-role.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    AuthenticationModule,
    RedisCacheModule,
    TypeOrmModule.forFeature([Permission, Role, UserConsumer, User, UserRole]),
    GlobalConfigurationModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
