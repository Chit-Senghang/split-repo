import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { Code, CodeValue } from '../key-value/entity';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { EmployeeModule } from '../employee/employee.module';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { MediaModule } from '../media/media.module';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { WorkingShiftModule } from '../workshift-type/working-shift/working-shift.module';
import { WorkingShiftRepository } from '../workshift-type/repository/working-shift.repository';
import { EmployeeMovementService } from './employee-movement.service';
import { EmployeeMovementController } from './employee-movement.controller';
import { EmployeeMovement } from './entities/employee-movement.entity';
import { EmployeeMovementValidationService } from './employee-movement-validation.service';
import { FilterEmployeePositionService } from './filter-employee-position';
import { EmployeeMovementRepository } from './repository/employee-movement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeMovement,
      EmployeePosition,
      CompanyStructure,
      Code,
      CodeValue,
      ApprovalStatus
    ]),
    EmployeeModule,
    MediaModule,
    WorkingShiftModule
  ],
  controllers: [EmployeeMovementController],
  providers: [
    EmployeeMovementService,
    EmployeeMovementValidationService,
    FilterEmployeePositionService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    EmployeeMovementRepository,
    WorkingShiftRepository
  ],
  exports: [
    EmployeeMovementService,
    EmployeeMovementValidationService,
    FilterEmployeePositionService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    EmployeeMovementRepository,
    WorkingShiftRepository
  ]
})
export class EmployeeMovementModule {}
