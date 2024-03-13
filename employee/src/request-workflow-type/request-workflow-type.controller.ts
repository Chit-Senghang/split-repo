import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UseGuards,
  Query
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { REQUEST_WORK_FLOW_TYPE_PERMISSION } from '../shared-resources/ts/enum/permission';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { RequestWorkflowTypePaginationDto } from './dto/pagination-request-workflow-type.dto';
import { RequestWorkFlowType } from './entities/request-workflow-type.entity';
import { UpdateRequestWorkflowTypeDto } from './dto/update-request-workflow-type.dto';
import { RequestWorkflowTypeService } from './request-workflow-type.service';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('request-workflow-type')
@Controller('request-workflow-type')
export class RequestWorkflowTypeController {
  constructor(
    private readonly requestWorkflowTypeService: RequestWorkflowTypeService
  ) {}

  @UseGuards(
    PermissionGuard(
      REQUEST_WORK_FLOW_TYPE_PERMISSION.READ_REQUEST_WORK_FLOW_TYPE
    )
  )
  @ApiOkResponse({ type: getPaginationResponseDto(RequestWorkFlowType) })
  @Get()
  findAll(
    @Query() requestWorkflowTypePaginationDto: RequestWorkflowTypePaginationDto
  ) {
    return this.requestWorkflowTypeService.findAll(
      requestWorkflowTypePaginationDto
    );
  }

  @UseGuards(
    PermissionGuard(
      REQUEST_WORK_FLOW_TYPE_PERMISSION.UPDATE_REQUEST_WORK_FLOW_TYPE
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateRequestWorkflowTypeDto: UpdateRequestWorkflowTypeDto
  ) {
    return this.requestWorkflowTypeService.update(
      id,
      updateRequestWorkflowTypeDto
    );
  }
}
