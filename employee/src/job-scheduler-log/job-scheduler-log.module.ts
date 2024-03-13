import { Module } from '@nestjs/common';
import { EmployeeWorkingScheduleModule } from '../employee-working-schedule/employee-working-schedule.module';
import { EmployeeModule } from '../employee/employee.module';
import { LeaveRequestModule } from '../leave/leave-request/leave-request.module';
import { AttendanceReportModule } from '../attendance/attendance-report/attendance-report.module';
import { PayrollBenefitAdjustmentModule } from '../payroll-benefit-adjustment/payroll-benefit-adjustment.module';
import { EmployeeResignationModule } from '../employee-resignation/employee-resignation.module';
import { EmployeeMovementModule } from '../employee-movement/employee-movement.module';
import { JobSchedulerLogService } from './job-scheduler-log-service';
import { CronService } from './cron.service';
import { JobSchedulerLogController } from './job-scheduler-log.controller';
import { JobSchedulerLogRepository } from './repository/job-scheduler-log.repository';

@Module({
  controllers: [JobSchedulerLogController],
  imports: [
    EmployeeWorkingScheduleModule,
    EmployeeModule,
    AttendanceReportModule,
    LeaveRequestModule,
    PayrollBenefitAdjustmentModule,
    EmployeeResignationModule,
    EmployeeMovementModule
  ],
  providers: [CronService, JobSchedulerLogService, JobSchedulerLogRepository],
  exports: [JobSchedulerLogService]
})
export class JobSchedulerLogModule {}
