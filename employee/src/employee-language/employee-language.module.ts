import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeLanguageService } from './employee-language.service';
import { EmployeeLanguageController } from './employee-language.controller';
import { EmployeeLanguage } from './entities/employee-language.entity';

@Module({
  controllers: [EmployeeLanguageController],
  providers: [EmployeeLanguageService],
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeLanguage, CodeValue, Code]),
    EmployeeModule
  ]
})
export class EmployeeLanguageModule {}
