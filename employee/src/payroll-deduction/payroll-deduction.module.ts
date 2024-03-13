import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollDeductionTypeModule } from '../payroll-deduction-type/payroll-deduction-type.module';
import { EmployeeModule } from '../employee/employee.module';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { MediaModule } from '../media/media.module';
import { PayrollDeductionService } from './payroll-deduction.service';
import { PayrollDeductionController } from './payroll-deduction.controller';
import { PayrollDeductionValidationService } from './payroll-deduction.validation.service';
import { PayrollDeduction } from './entities/payroll-deduction.entity';

@Module({
  controllers: [PayrollDeductionController],
  providers: [
    PayrollDeductionService,
    PayrollDeductionValidationService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository
  ],
  imports: [
    TypeOrmModule.forFeature([PayrollDeduction]),
    PayrollDeductionTypeModule,
    EmployeeModule,
    MediaModule
  ],
  exports: [PayrollDeductionService, PayrollDeductionValidationService]
})
export class PayrollDeductionModule {}
