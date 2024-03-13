import { Module } from '@nestjs/common';
import { EmployeeWarningModule } from '../employee-warning/employee-warning.module';
import { EmployeeResignationModule } from '../employee-resignation/employee-resignation.module';
import { EmployeeModule } from '../employee/employee.module';
import { MissionRequestModule } from '../leave/mission-request/mission-request.module';
import { LeaveRequestModule } from '../leave/leave-request/leave-request.module';
import { MissedScanRequestModule } from '../attendance/missed-scan-request/missed-scan-request.module';
import { BorrowOrPaybackModule } from '../attendance/borrow-or-payback/borrow-or-payback.module';
import { DayOffRequestModule } from '../leave/day-off-request/day-off-request.module';
import { EmployeeMovementModule } from '../employee-movement/employee-movement.module';
import { CompanyStructureModule } from '../company-structure/company-structure.module';
import { EventsModule } from '../events/events.module';
import { NotificationModule } from '../notification/notification.module';
import { PayrollDeductionModule } from '../payroll-deduction/payroll-deduction.module';
import { PayrollBenefitAdjustmentModule } from '../payroll-benefit-adjustment/payroll-benefit-adjustment.module';
import { FirebaseService } from '../firebase/firebase.service';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { OvertimeRequestModule } from '../attendance/overtime-request/overtime-request.module';
import { RequestWorkFlowTypeRepository } from '../request-workflow-type/repository/request-workflow-type.repository';
import { RequestApprovalWorkflowLevelRepository } from '../request-approval-workflow/repository/request-approval-workflow-level.repository';
import { MediaModule } from '../media/media.module';
import { ApprovalStatusTrackingController } from './approval-status-tracking.controller';
import { ApprovalStatusRepository } from './repository/approval-status.repository';
import { ApprovalStatusTrackingService } from './approval-status-tracking.service';

@Module({
  controllers: [ApprovalStatusTrackingController],
  providers: [
    ApprovalStatusTrackingService,
    FirebaseService,
    EmployeeRepository,
    ApprovalStatusRepository,
    RequestWorkFlowTypeRepository,
    RequestApprovalWorkflowLevelRepository
  ],
  exports: [ApprovalStatusTrackingService],
  imports: [
    EmployeeWarningModule,
    EmployeeResignationModule,
    EmployeeModule,
    DayOffRequestModule,
    MissionRequestModule,
    LeaveRequestModule,
    MissedScanRequestModule,
    BorrowOrPaybackModule,
    OvertimeRequestModule,
    EmployeeMovementModule,
    CompanyStructureModule,
    EventsModule,
    NotificationModule,
    PayrollDeductionModule,
    PayrollBenefitAdjustmentModule,
    MediaModule
  ]
})
export class ApprovalStatusTrackingModule {}
