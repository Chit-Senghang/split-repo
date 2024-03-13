import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UseGuards,
  Query,
  Post
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../../guards/permission.guard';
import { OVERTIME_REQUEST_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/overtime-request-type.enum';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { OvertimeRequestTypeService } from './overtime-request-type.service';
import { UpdateOvertimeRequestTypeDto } from './dto/update-overtime-request-type.dto';
import { OvertimeRequestType } from './entities/overtime-request-type.entity';
import { PaginationQueryOvertimeRequestTypeDto } from './dto/pagination-query-overtime-request-type.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('overtime-request-type')
@Controller('overtime-request-type')
export class OvertimeRequestTypeController {
  constructor(
    private readonly overtimeRequestTypeService: OvertimeRequestTypeService
  ) {}

  @UseGuards(
    PermissionGuard(OVERTIME_REQUEST_TYPE_PERMISSION.READ_OVERTIME_REQUEST_TYPE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(OvertimeRequestType) })
  @Get()
  findAll(@Query() pagination: PaginationQueryOvertimeRequestTypeDto) {
    return this.overtimeRequestTypeService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryOvertimeRequestTypeDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.overtimeRequestTypeService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(
    PermissionGuard(OVERTIME_REQUEST_TYPE_PERMISSION.READ_OVERTIME_REQUEST_TYPE)
  )
  @ApiOkResponse({ type: OvertimeRequestType })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.overtimeRequestTypeService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      OVERTIME_REQUEST_TYPE_PERMISSION.UPDATE_OVERTIME_REQUEST_TYPE
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateOvertimeRequestTypeDto: UpdateOvertimeRequestTypeDto
  ) {
    return this.overtimeRequestTypeService.update(
      id,
      updateOvertimeRequestTypeDto
    );
  }
}
