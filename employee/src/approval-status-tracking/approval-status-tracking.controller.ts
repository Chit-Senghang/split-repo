import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UseGuards,
  Query,
  ParseIntPipe,
  Post
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { APPROVAL_STATUS_TRACKING_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/approval-status-tracking.enum';
import { WorkflowTypeEnum } from '../shared-resources/common/enum/workflow-type.enum';
import { ApprovalStatusTrackingService } from './approval-status-tracking.service';
import { UpdateApprovalStatusTrackingDto } from './dto/update-approval-status-tracking.dto';
import { ApprovalStatus } from './entities/approval-status-tracking.entity';
import { ApprovalStatusTrackingPagination } from './dto/pagination-approval-status-tracking.dto';
import { ApprovalStatusEnum } from './common/ts/enum/approval-status.enum';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('approval-status-tracking')
@Controller('approval-status-tracking')
export class ApprovalStatusTrackingController {
  constructor(
    private readonly approvalStatusTrackingService: ApprovalStatusTrackingService
  ) {}

  @UseGuards(
    PermissionGuard(
      APPROVAL_STATUS_TRACKING_PERMISSION.READ_APPROVAL_STATUS_TRACKING
    )
  )
  @ApiOkResponse({ type: ApprovalStatus })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.approvalStatusTrackingService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      APPROVAL_STATUS_TRACKING_PERMISSION.READ_APPROVAL_STATUS_TRACKING
    )
  )
  @ApiOkResponse({ type: ApprovalStatus })
  @Get()
  findApprovalStatusForEmployee(
    @Query() pagination: ApprovalStatusTrackingPagination
  ) {
    return this.approvalStatusTrackingService.getApprovalWorkflowForCurrentEmployee(
      pagination
    );
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: ApprovalStatusTrackingPagination,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.approvalStatusTrackingService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(
    PermissionGuard(
      APPROVAL_STATUS_TRACKING_PERMISSION.READ_APPROVAL_STATUS_TRACKING
    )
  )
  @ApiOkResponse({ type: ApprovalStatus })
  @Get('entity/:entityId/entityType/:entityType')
  findOneByEntityId(
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query('status') status: ApprovalStatusEnum,
    @Param('entityType') entityType: WorkflowTypeEnum
  ) {
    return this.approvalStatusTrackingService.findOneByEntityIdAndType(
      entityId,
      entityType,
      status
    );
  }

  @UseGuards(
    PermissionGuard(
      APPROVAL_STATUS_TRACKING_PERMISSION.READ_APPROVAL_STATUS_TRACKING
    )
  )
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateApprovalStatusTrackingDto: UpdateApprovalStatusTrackingDto
  ) {
    return this.approvalStatusTrackingService.update(
      id,
      updateApprovalStatusTrackingDto
    );
  }
}
