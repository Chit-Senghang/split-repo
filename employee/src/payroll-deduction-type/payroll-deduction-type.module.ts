import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollDeductionTypeService } from './payroll-deduction-type.service';
import { PayrollDeductionTypeController } from './payroll-deduction-type.controller';
import { PayrollDeductionType } from './entities/payroll-deduction-type.entity';
import { PayrollDeductionTypeValidationService } from './payroll-deduction-type.validation.service';

@Module({
  controllers: [PayrollDeductionTypeController],
  providers: [
    PayrollDeductionTypeService,
    PayrollDeductionTypeValidationService
  ],
  imports: [TypeOrmModule.forFeature([PayrollDeductionType])],
  exports: [PayrollDeductionTypeService, PayrollDeductionTypeValidationService]
})
export class PayrollDeductionTypeModule {}
