import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { MediaModule } from '../media/media.module';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EmployeeResignationService } from './employee-resignation.service';
import { EmployeeResignationController } from './employee-resignation.controller';
import { EmployeeResignation } from './entity/employee-resignation.entity';
import { EmployeeResignationValidationService } from './employee-resignation-validation.service';
import { EmployeeResignationRepository } from './repository/employee-resignation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeResignation,
      Employee,
      CodeValue,
      Code,
      EmployeePosition,
      CompanyStructure,
      ApprovalStatus,
      Employee
    ]),
    MediaModule
  ],
  controllers: [EmployeeResignationController],
  providers: [
    EmployeeResignationService,
    EmployeeResignationValidationService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    EmployeeResignationRepository
  ],
  exports: [
    EmployeeResignationService,
    EmployeeResignationValidationService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    EmployeeResignationRepository
  ]
})
export class EmployeeResignationModule {}
