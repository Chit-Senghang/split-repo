import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { EmployeeIdentifier } from '../employee-identifier/entities/employee-identifier.entity';
import { PayrollReport } from '../payroll-generation/entities/payroll-report.entity';
import { PayrollBenefitAdjustment } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';
import { NssfService } from './nssf.service';
import { NssfController } from './nssf.controller';
import { Nssf } from './entities/nssf.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeePosition,
      EmployeeIdentifier,
      Nssf,
      PayrollReport,
      PayrollBenefitAdjustment
    ])
  ],
  controllers: [NssfController],
  providers: [NssfService]
})
export class NssfModule {}
