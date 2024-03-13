import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { EmployeeResignationRepository } from '../../../employee-resignation/repository/employee-resignation.repository';
import { ReportEmployeeMovementService } from './report-employee-movement.service';
import { ReportEmployeeMovementController } from './report-employee-movement.controller';
import { ReportEmployeeMovementRepository } from './repository/report-employee-movement.repository';

@Module({
  controllers: [ReportEmployeeMovementController],
  providers: [
    ReportEmployeeMovementService,
    EmployeeRepository,
    EmployeeResignationRepository,
    ReportEmployeeMovementRepository
  ]
})
export class ReportEmployeeMovementModule {}
