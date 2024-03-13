import { Module } from '@nestjs/common';
import { LeaveStockRepository } from '../../leave/leave-request/repository/leave-stock.repository';
import { LeaveTypeRepository } from '../../leave/leave-request-type/repository/leave-type.repository';
import { LeaveRemainingReportService } from './leave-remaining-report.service';
import { LeaveRemainingReportController } from './leave-remaining-report.controller';

@Module({
  controllers: [LeaveRemainingReportController],
  providers: [
    LeaveRemainingReportService,
    LeaveStockRepository,
    LeaveTypeRepository
  ]
})
export class LeaveRemainingReportModule {}
