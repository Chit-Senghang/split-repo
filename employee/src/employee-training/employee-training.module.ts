import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeTrainingService } from './employee-training.service';
import { EmployeeTrainingController } from './employee-training.controller';
import { EmployeeTraining } from './entities/employee-training.entity';

@Module({
  controllers: [EmployeeTrainingController],
  providers: [EmployeeTrainingService],
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeTraining, CodeValue, Code]),
    EmployeeModule
  ]
})
export class EmployeeTrainingModule {}
