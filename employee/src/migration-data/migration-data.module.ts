import { Module } from '@nestjs/common';
import { LeaveTypeRepository } from '../leave/leave-request-type/repository/leave-type.repository';
import { FileExtensionValidationPipe } from '../media/common/validators/file-extension.validator';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { LeaveTypeVariationRepository } from '../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveRequestRepository } from '../leave/leave-request/repository/leave-request.repository';
import { LeaveStockRepository } from '../leave/leave-request/repository/leave-stock.repository';
import { LeaveStockDetailRepository } from '../leave/leave-request/repository/leave-stock-detail.repository';
import { LeaveRequestTypeModule } from '../leave/leave-request-type/leave-request-type.module';
import { MigrationDataService } from './migration-data.service';
import { MigrationDataController } from './migration-data.controller';

@Module({
  controllers: [MigrationDataController],
  providers: [
    MigrationDataService,
    LeaveTypeRepository,
    FileExtensionValidationPipe,
    EmployeeRepository,
    LeaveTypeRepository,
    LeaveTypeVariationRepository,
    LeaveRequestRepository,
    LeaveStockRepository,
    LeaveStockDetailRepository
  ],
  imports: [LeaveRequestTypeModule]
})
export class MigrationDataModule {}
