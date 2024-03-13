import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurance } from './entities/insurance.entity';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';

@Module({
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
  imports: [TypeOrmModule.forFeature([Insurance])]
})
export class InsuranceModule {}
