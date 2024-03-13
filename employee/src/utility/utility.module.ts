import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Employee } from '../employee/entity/employee.entity';
import { MediaModule } from '../media/media.module';
import { Media } from '../media/entities/media.entity';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { RequestApprovalWorkflow } from '../request-approval-workflow/entities/request-approval-workflow.entity';
import { NotificationModule } from '../notification/notification.module';
import { EventsModule } from '../events/events.module';
import { RequestApprovalWorkflowLevel } from '../request-approval-workflow/entities/request-approval-workflow-level.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EnvironmentService } from '../config/environment.service';
import { UtilityService } from './utility.service';

@Global()
@Module({
  providers: [
    UtilityService,
    FirebaseService,
    EmployeeRepository,
    EnvironmentService,
    ConfigService
  ],
  exports: [
    UtilityService,
    EmployeeRepository,
    FirebaseService,
    EnvironmentService,
    ConfigService
  ],
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Media,
      ApprovalStatus,
      RequestApprovalWorkflow,
      RequestApprovalWorkflowLevel
    ]),
    MediaModule,
    NotificationModule,
    EventsModule
  ]
})
export class UtilityModule {}
