import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollMaster } from '../payroll-generation/entities/payroll-master.entity';
import { PayrollReport } from '../payroll-generation/entities/payroll-report.entity';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { PayrollAdjustmentSummaryReportController } from './payroll-adjustment-summary-report.controller';
import { PayrollAdjustmentSummaryReportService } from './payroll-adjustment-summary-report.service';
import { PayrollAdjustmentSummaryMasterReportDto } from './dto/payroll-adjustment-summary-report.dto';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollMaster, PayrollReport, BenefitComponent])
  ],
  controllers: [PayrollAdjustmentSummaryReportController],
  providers: [
    PayrollAdjustmentSummaryReportService,
    PayrollAdjustmentSummaryMasterReportDto
  ]
})
export class PayrollAdjustmentSummaryReportModule {}
