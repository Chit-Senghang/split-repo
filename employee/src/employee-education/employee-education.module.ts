import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { CodeValue } from '../key-value/entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeEducationService } from './employee-education.service';
import { EmployeeEducationController } from './employee-education.controller';
import { EmployeeEducation } from './entities/employee-education.entity';

@Module({
  controllers: [EmployeeEducationController],
  providers: [EmployeeEducationService],
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeEducation, CodeValue]),
    EmployeeModule
  ]
})
export class EmployeeEducationModule {}
