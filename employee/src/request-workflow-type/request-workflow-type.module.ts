import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestWorkFlowType } from './entities/request-workflow-type.entity';
import { RequestWorkflowTypeService } from './request-workflow-type.service';
import { RequestWorkflowTypeController } from './request-workflow-type.controller';
import { RequestWorkflowTypeValidationService } from './request-workflow-type.validation.service';

@Global()
@Module({
  controllers: [RequestWorkflowTypeController],
  providers: [RequestWorkflowTypeService, RequestWorkflowTypeValidationService],
  imports: [TypeOrmModule.forFeature([RequestWorkFlowType])],
  exports: [RequestWorkflowTypeService, RequestWorkflowTypeValidationService]
})
export class RequestWorkflowTypeModule {}
