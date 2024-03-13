import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { MediaModule } from '../media/media.module';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EmployeeWarningService } from './employee-warning.service';
import { EmployeeWarningController } from './employee-warning.controller';
import { EmployeeWarning } from './entities/employee-warning.entity';
import { EmployeeWarningRepository } from './repository/employee-warning.repository';

@Module({
  providers: [
    EmployeeWarningService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    EmployeeWarningRepository
  ],
  controllers: [EmployeeWarningController],
  exports: [EmployeeWarningService, EmployeeWarningRepository],
  imports: [
    TypeOrmModule.forFeature([
      EmployeeWarning,
      Employee,
      CodeValue,
      Code,
      EmployeePosition,
      CompanyStructure,
      PositionLevel,
      ApprovalStatus
    ]),
    MediaModule
  ]
})
export class EmployeeWarningModule {}
