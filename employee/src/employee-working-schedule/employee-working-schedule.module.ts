import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { AttendanceReportModule } from '../attendance/attendance-report/attendance-report.module';
import { EmployeeWorkingScheduleController } from './employee-working-schedule.controller';
import { EmployeeWorkingSchedule } from './entities/employee-working-schedule.entity';
import { EmployeeWorkingScheduleService } from './employee-working-schedule.service';

@Module({
  controllers: [EmployeeWorkingScheduleController],
  providers: [EmployeeWorkingScheduleService],
  imports: [
    TypeOrmModule.forFeature([EmployeeWorkingSchedule, Employee]),
    AttendanceReportModule
  ],
  exports: [EmployeeWorkingScheduleService]
})
export class EmployeeWorkingScheduleModule {}
