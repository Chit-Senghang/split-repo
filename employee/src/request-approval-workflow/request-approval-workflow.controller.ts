import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Put,
  HttpCode
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { REQUEST_APPROVAL_WORKFLOW_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/request-approval-workflow-enum';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { RequestApprovalWorkflowService } from './request-approval-workflow.service';
import { CreateRequestApprovalWorkflowDto } from './dto/create-request-approval-workflow.dto';
import { RequestApprovalWorkflow } from './entities/request-approval-workflow.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('request-approval-workflow')
@Controller('request-workflow-type')
export class RequestApprovalWorkflowController {
  constructor(
    private readonly requestApprovalWorkflowService: RequestApprovalWorkflowService
  ) {}

  @UseGuards(
    PermissionGuard(
      REQUEST_APPROVAL_WORKFLOW_PERMISSION.CREATE_REQUEST_APPROVAL_WORKFLOW
    )
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post(':id/workflow')
  create(
    @Body() createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowDto,
    @Param('id') id: number
  ) {
    return this.requestApprovalWorkflowService.createOrUpdateWorkflow(
      null,
      id,
      createRequestApprovalWorkflowDto
    );
  }

  @UseGuards(
    PermissionGuard(
      REQUEST_APPROVAL_WORKFLOW_PERMISSION.UPDATE_REQUEST_APPROVAL_WORKFLOW
    )
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Put('workflow/:id')
  update(
    @Body() createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowDto,
    @Param('id') approvalWorkflowId: number
  ) {
    return this.requestApprovalWorkflowService.update(
      approvalWorkflowId,
      createRequestApprovalWorkflowDto
    );
  }

  @UseGuards(
    PermissionGuard(
      REQUEST_APPROVAL_WORKFLOW_PERMISSION.READ_REQUEST_APPROVAL_WORKFLOW
    )
  )
  @ApiOkResponse({ type: RequestApprovalWorkflow })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestApprovalWorkflowService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      REQUEST_APPROVAL_WORKFLOW_PERMISSION.UPDATE_REQUEST_APPROVAL_WORKFLOW
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Put('workflow/:request_approval_workflow_id/enable')
  enableStatus(
    @Param('request_approval_workflow_id') id: number,
    @Body() enable: boolean
  ) {
    return this.requestApprovalWorkflowService.enableWorkflow(id, enable);
  }

  @UseGuards(
    PermissionGuard(
      REQUEST_APPROVAL_WORKFLOW_PERMISSION.DELETE_REQUEST_APPROVAL_WORKFLOW
    )
  )
  @Delete('workflow/:request_approval_workflow_id')
  @HttpCode(204)
  remove(@Param('request_approval_workflow_id') workflowId: number) {
    return this.requestApprovalWorkflowService.deleteWorkflow(workflowId);
  }
}
