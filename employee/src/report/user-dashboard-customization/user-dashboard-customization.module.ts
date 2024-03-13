import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDashboardCustomizationService } from './user-dashboard-customization.service';
import { UserDashboardCustomizationController } from './user-dashboard-customization.controller';
import { UserDashboardCustomizationRepository } from './repository/user-dashboard-customization.repository';
import { UserDashboardCustomization } from './entities/user-dashboard-customization.entity';

@Module({
  controllers: [UserDashboardCustomizationController],
  providers: [
    UserDashboardCustomizationService,
    UserDashboardCustomizationRepository
  ],
  imports: [TypeOrmModule.forFeature([UserDashboardCustomization])]
})
export class UserDashboardCustomizationModule {}
