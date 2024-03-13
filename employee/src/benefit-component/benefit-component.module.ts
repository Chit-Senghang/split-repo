import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitComponentType } from '../benefit-component-type/entities/benefit-component-type.entity';
import { BenefitComponentService } from './benefit-component.service';
import { SalaryComponentController } from './benefit-component.controller';
import { BenefitComponent } from './entities/benefit-component.entity';
import { BenefitComponentValidationService } from './benefit-component.validation';

@Module({
  controllers: [SalaryComponentController],
  providers: [BenefitComponentService, BenefitComponentValidationService],
  imports: [TypeOrmModule.forFeature([BenefitComponent, BenefitComponentType])],
  exports: [BenefitComponentValidationService, BenefitComponentService]
})
export class BenefitComponentModule {}
