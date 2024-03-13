import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { Role } from '../role/entities/role.entity';
import { KongJwtService } from '../authentication/kong-jwt.service';
import { GlobalConfiguration } from './entities/global-configuration.entity';
import { GlobalConfigurationController } from './global-configuration.controller';
import { GlobalConfigurationService } from './global-configuration.service';

@Global()
@Module({
  controllers: [GlobalConfigurationController],
  providers: [GlobalConfigurationService, UserService, KongJwtService],
  imports: [
    TypeOrmModule.forFeature([GlobalConfiguration, User, UserRole, Role])
  ],
  exports: [GlobalConfigurationService]
})
export class GlobalConfigurationModule {}
