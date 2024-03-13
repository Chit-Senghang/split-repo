import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { CompanyStructureComponent } from '../company-structure/company-structure-component/entities/company-structure-component.entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EmployeePositionController } from './employee-position.controller';
import { EmployeePosition } from './entities/employee-position.entity';
import { EmployeePositionService } from './employee-position.service';

@Module({
  controllers: [EmployeePositionController],
  providers: [EmployeePositionService, EmployeeRepository],
  imports: [
    TypeOrmModule.forFeature([
      EmployeePosition,
      Employee,
      CompanyStructure,
      CompanyStructureComponent
    ]),
    EmployeeModule
  ],
  exports: [EmployeePositionService, EmployeeRepository]
})
export class EmployeePositionModule {}
