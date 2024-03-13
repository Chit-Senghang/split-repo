import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { CodeValue } from '../key-value/entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeEmergencyContactController } from './employee-emergency-contact.controller';
import { EmployeeEmergencyContactService } from './employee-emergency-contact.service';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';

@Module({
  controllers: [EmployeeEmergencyContactController],
  providers: [EmployeeEmergencyContactService],
  imports: [
    TypeOrmModule.forFeature([
      EmployeeEmergencyContact,
      Employee,
      CodeValue,
      Employee
    ]),
    EmployeeModule
  ]
})
export class EmployeeEmergencyContactModule {}
