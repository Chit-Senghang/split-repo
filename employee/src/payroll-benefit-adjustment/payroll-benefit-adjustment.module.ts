import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { PayrollReport } from '../payroll-generation/entities/payroll-report.entity';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { MediaModule } from '../media/media.module';
import { BenefitAdjustmentType } from '../benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { EmployeeMovementRepository } from '../employee-movement/repository/employee-movement.repository';
import { PayrollBenefitAdjustmentService } from './payroll-benefit-adjustment.service';
import { PayrollBenefitAdjustmentController } from './payroll-benefit-adjustment.controller';
import { PayrollBenefitAdjustment } from './entities/payroll-benefit-adjustment.entity';
import { PayrollBenefitAdjustmentDetail } from './entities/payroll-benefit-adjustment-detail.entity';
import { PayrollBenefitController } from './payroll-benefit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayrollBenefitAdjustment,
      PayrollBenefitAdjustmentDetail,
      BenefitAdjustmentType,
      Employee,
      BenefitComponent,
      PayrollReport
    ]),
    MediaModule
  ],
  controllers: [PayrollBenefitAdjustmentController, PayrollBenefitController],
  providers: [
    PayrollBenefitAdjustmentService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    EmployeeMovementRepository
  ],
  exports: [PayrollBenefitAdjustmentService]
})
export class PayrollBenefitAdjustmentModule {}
