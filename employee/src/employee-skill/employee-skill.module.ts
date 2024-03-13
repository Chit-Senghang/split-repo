import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeSkillService } from './employee-skill.service';
import { EmployeeSkillController } from './employee-skill.controller';
import { EmployeeSkill } from './entities/employee-skill.entity';

@Module({
  controllers: [EmployeeSkillController],
  providers: [EmployeeSkillService],
  imports: [
    TypeOrmModule.forFeature([EmployeeSkill, Employee, CodeValue, Code]),
    EmployeeModule
  ]
})
export class EmployeeSkillModule {}
