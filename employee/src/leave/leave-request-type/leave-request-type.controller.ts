import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Query,
  UseInterceptors,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../../guards/permission.guard';
import { LEAVE_REQUEST_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/leave-request-type-permission.enum';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { LeaveRequestTypeService } from './leave-request-type.service';
import { UpdateLeaveRequestTypeDto } from './dto/update-leave-request-type.dto';
import { PaginationLeaveRequestTypeDto } from './dto/pagination-leave-request-type.dto';
import { LeaveTypeDto } from './dto/create-leave-type.dto';
import { LeaveType } from './entities/leave-type.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('leave-request-type')
@Controller('leave-request-type')
export class LeaveRequestTypeController {
  constructor(
    private readonly leaveRequestTypeService: LeaveRequestTypeService
  ) {}

  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.CREATE_LEAVE_REQUEST_TYPE)
  )
  @UseInterceptors(ResponseMappingInterceptor)
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createLeaveRequestTypeDto: LeaveTypeDto) {
    return this.leaveRequestTypeService.create(createLeaveRequestTypeDto);
  }

  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.CREATE_LEAVE_REQUEST_TYPE)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('generate-stock/:leaveTypeId')
  generateLeaveStockForLeaveType(
    @Param('leaveTypeId', ParseIntPipe) id: number,
    @Query() { date }: { date: string }
  ) {
    return this.leaveRequestTypeService.generateStockForLeaveType(id, date);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.READ_LEAVE_REQUEST_TYPE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(LeaveType) })
  @Get()
  findAll(@Query() pagination: PaginationLeaveRequestTypeDto) {
    return this.leaveRequestTypeService.findAll(pagination);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationLeaveRequestTypeDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.leaveRequestTypeService.exportFile(pagination, exportFileDto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.READ_LEAVE_REQUEST_TYPE)
  )
  @ApiOkResponse({ type: LeaveType })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.leaveRequestTypeService.findOne(id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.READ_LEAVE_REQUEST_TYPE)
  )
  @ApiOkResponse({ type: LeaveType })
  @Get('employee/:id')
  findByEmployeeId(@Param('id') id: number) {
    return this.leaveRequestTypeService.findLeaveTypeByEmployee(id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.UPDATE_LEAVE_REQUEST_TYPE)
  )
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateLeaveRequestTypeDto: UpdateLeaveRequestTypeDto
  ) {
    return this.leaveRequestTypeService.update(id, updateLeaveRequestTypeDto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(LEAVE_REQUEST_TYPE_PERMISSION.DELETE_LEAVE_REQUEST_TYPE)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.leaveRequestTypeService.delete(id);
  }
}
