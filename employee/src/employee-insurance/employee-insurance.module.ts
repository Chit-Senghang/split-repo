import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeInsuranceService } from './employee-insurance.service';
import { EmployeeInsuranceController } from './employee-insurance.controller';
import { EmployeeInsurance } from './entities/employee-insurance.entity';

@Module({
  controllers: [EmployeeInsuranceController],
  providers: [EmployeeInsuranceService],
  imports: [
    TypeOrmModule.forFeature([EmployeeInsurance, Employee, Insurance]),
    EmployeeModule
  ]
})
export class EmployeeInsuranceModule {}
