import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryComponentTypeService } from './benefit-component-type.service';
import { SalaryComponentTypeController } from './benefit-component-type.controller';
import { BenefitComponentType } from './entities/benefit-component-type.entity';

@Module({
  controllers: [SalaryComponentTypeController],
  providers: [SalaryComponentTypeService],
  imports: [TypeOrmModule.forFeature([BenefitComponentType])],
  exports: [SalaryComponentTypeService]
})
export class SalaryComponentTypeModule {}
