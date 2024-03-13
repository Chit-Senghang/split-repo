import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollCycleConfigurationService } from './payroll-cycle-configuration.service';
import { PayrollCycleConfigurationController } from './payroll-cycle-configuration.controller';
import { PayrollCycleConfiguration } from './entities/payroll-cycle-configuration.entity';
import { PayrollCycleConfigurationRepository } from './repository/payroll-cycle-configuration.repository';

@Module({
  controllers: [PayrollCycleConfigurationController],
  providers: [
    PayrollCycleConfigurationService,
    PayrollCycleConfigurationRepository
  ],
  imports: [TypeOrmModule.forFeature([PayrollCycleConfiguration])]
})
export class PayrollCycleConfigurationModule {}
