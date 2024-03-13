import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { CodeValue } from '../key-value/entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeIdentifierService } from './employee-identifier.service';
import { EmployeeIdentifierController } from './employee-identifier.controller';
import { EmployeeIdentifier } from './entities/employee-identifier.entity';

@Module({
  controllers: [EmployeeIdentifierController],
  providers: [EmployeeIdentifierService],
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeIdentifier, CodeValue]),
    EmployeeModule
  ]
})
export class EmployeeIdentifierModule {}
