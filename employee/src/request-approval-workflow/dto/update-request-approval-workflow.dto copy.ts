import { PartialType } from '@nestjs/swagger';
import { CreateRequestApprovalWorkflowLevelDto } from './create-request-approval-workflow-level.dto';

export class UpdateRequestApprovalWorkflowLevelDto extends PartialType(
  CreateRequestApprovalWorkflowLevelDto
) {}
