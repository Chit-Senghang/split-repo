import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EmployeeContactService } from './employee-contact.service';
import { EmployeeContactController } from './employee-contact.controller';
import { EmployeeContact } from './entities/employee-contact.entity';

@Module({
  controllers: [EmployeeContactController],
  providers: [EmployeeContactService, EmployeeRepository],
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeContact]),
    EmployeeModule
  ]
})
export class EmployeeContactModule {}
