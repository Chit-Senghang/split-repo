import { Module } from '@nestjs/common';
import { AttendanceReportRepository } from '../attendance/attendance-report/repository/attendance-report.repository';
import { PayrollBenefitAdjustmentRepository } from '../payroll-benefit-adjustment/repository/payroll-benefit-adjustment.repository';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { PayrollDeductionRepository } from '../payroll-deduction/repository/payroll-deduction.repository';
import { PayrollDeductionTypeRepository } from '../payroll-deduction-type/repository/payroll-deduction-type.repository';
import { CompanyStructureRepository } from '../company-structure/repository/company-structure.repository';
import { PaymentMethodRepository } from '../payment-method/repository/payment-method.repository';
import { BenefitComponentRepository } from '../benefit-component/repository/benefit-component.repository';
import { EmployeePositionRepository } from '../employee-position/repository/employee-position.repository';
import { LeaveStockRepository } from '../leave/leave-request/repository/leave-stock.repository';
import { PayrollGenerationService } from './payroll-generation.service';
import { PayrollGenerationController } from './payroll-generation.controller';
import { SummaryPrintForAccount } from './summary-print-for-account.service';
import { PayrollReportRepository } from './repository/payroll-report.repository';
import { PayrollMasterRepository } from './repository/payroll-master.repository';
import { PayrollByStoreRepository } from './repository/payroll-by-store.repository';
import { PayrollTaxRepository } from './repository/payroll-tax.repository';

@Module({
  imports: [],
  controllers: [PayrollGenerationController],
  providers: [
    PayrollGenerationService,
    SummaryPrintForAccount,
    AttendanceReportRepository,
    PayrollBenefitAdjustmentRepository,
    EmployeeRepository,
    PayrollDeductionRepository,
    PayrollReportRepository,
    PayrollMasterRepository,
    PayrollDeductionTypeRepository,
    CompanyStructureRepository,
    PaymentMethodRepository,
    PayrollByStoreRepository,
    PayrollTaxRepository,
    BenefitComponentRepository,
    EmployeePositionRepository,
    LeaveStockRepository
  ]
})
export class PayrollGenerationModule {}
