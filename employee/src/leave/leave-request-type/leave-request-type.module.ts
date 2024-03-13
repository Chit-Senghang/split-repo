import { Module } from '@nestjs/common';
import { PublicHolidayRepository } from '../../attendance/public-holiday/repository/public-holiday.repository';
import { LeaveRequestRepository } from '../leave-request/repository/leave-request.repository';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { LeaveStockRepository } from '../leave-request/repository/leave-stock.repository';
import { LeaveRequestTypeController } from './leave-request-type.controller';
import { LeaveRequestTypeService } from './leave-request-type.service';
import { LeaveTypeVariationRepository } from './repository/leave-type-variation.repository';
import { LeaveTypeRepository } from './repository/leave-type.repository';
import { LeaveRequestTypeRepository } from './repository/leave-request-type.repository';

@Module({
  controllers: [LeaveRequestTypeController],
  providers: [
    LeaveRequestTypeService,
    LeaveRequestTypeRepository,
    LeaveTypeRepository,
    LeaveTypeVariationRepository,
    PublicHolidayRepository,
    LeaveRequestRepository,
    EmployeeRepository,
    LeaveStockRepository
  ],
  exports: [
    LeaveRequestTypeService,
    LeaveRequestTypeRepository,
    LeaveTypeRepository,
    LeaveTypeVariationRepository,
    PublicHolidayRepository,
    LeaveRequestRepository,
    EmployeeRepository,
    LeaveStockRepository
  ]
})
export class LeaveRequestTypeModule {}
