import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { RequestWorkFlowType } from '../request-workflow-type/entities/request-workflow-type.entity';
import { Employee } from '../employee/entity/employee.entity';
import { RequestApprovalWorkflowService } from './request-approval-workflow.service';
import { RequestApprovalWorkflowController } from './request-approval-workflow.controller';
import { RequestApprovalWorkflow } from './entities/request-approval-workflow.entity';

@Global()
@Module({
  controllers: [RequestApprovalWorkflowController],
  providers: [RequestApprovalWorkflowService],
  imports: [
    TypeOrmModule.forFeature([
      RequestApprovalWorkflow,
      CompanyStructure,
      PositionLevel,
      RequestWorkFlowType,
      Employee
    ])
  ],
  exports: [RequestApprovalWorkflowService]
})
export class RequestApprovalWorkflowModule {}
