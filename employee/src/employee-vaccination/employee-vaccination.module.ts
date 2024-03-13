import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeVaccinationService } from './employee-vaccination.service';
import { EmployeeVaccinationController } from './employee-vaccination.controller';
import { EmployeeVaccination } from './entities/employee-vaccination.entity';

@Module({
  controllers: [EmployeeVaccinationController],
  providers: [EmployeeVaccinationService],
  imports: [
    TypeOrmModule.forFeature([EmployeeVaccination, Vaccination, Employee])
  ]
})
export class EmployeeVaccinationModule {}
