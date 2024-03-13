import { Module } from '@nestjs/common';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { LeaveTypeVariationRepository } from '../../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { LeaveTypeRepository } from '../../leave/leave-request-type/repository/leave-type.repository';
import { MediaModule } from '../../media/media.module';
import { LeaveRequestTypeModule } from '../../leave/leave-request-type/leave-request-type.module';
import { BorrowOrPaybackService } from './borrow-or-payback.service';
import { BorrowOrPaybackController } from './borrow-or-payback.controller';
import { BorrowOrPayBackRequestRepository } from './repository/borrow-or-payback-request.repository';

@Module({
  controllers: [BorrowOrPaybackController],
  providers: [
    BorrowOrPaybackService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    BorrowOrPayBackRequestRepository,
    LeaveRequestRepository,
    LeaveTypeVariationRepository,
    LeaveStockRepository,
    LeaveTypeRepository
  ],
  imports: [MediaModule, LeaveRequestTypeModule],
  exports: [BorrowOrPaybackService]
})
export class BorrowOrPaybackModule {}
