import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitAdjustmentTypeService } from './benefit-adjustment-type.service';
import { BenefitAdjustmentTypeController } from './benefit-adjustment-type.controller';
import { BenefitAdjustmentTypeRepository } from './repository/benefit-adjustment-type.repository';
import { BenefitAdjustmentType } from './entities/benefit-adjustment-type.entity';

@Module({
  controllers: [BenefitAdjustmentTypeController],
  providers: [BenefitAdjustmentTypeService, BenefitAdjustmentTypeRepository],
  imports: [TypeOrmModule.forFeature([BenefitAdjustmentType])]
})
export class BenefitAdjustmentTypeModule {}
