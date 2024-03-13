import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Query,
  HttpCode
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../../guards/permission.guard';
import { LEAVE_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/leave-request-permission.enum';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { PaginationLeaveRequestDto } from './dto/pagination-leave-request.dto';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveStockPagination } from './dto/leave-stock-paginate.dto';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('leave-request')
@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveRequestService.create(createLeaveRequestDto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(LeaveRequest) })
  @Get()
  findAll(@Query() pagination: PaginationLeaveRequestDto) {
    return this.leaveRequestService.findAll(pagination);
  }

  @Post('export')
  exportLeaveRequestFile(
    @Query()
    pagination: PaginationLeaveRequestDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.leaveRequestService.exportLeaveRequestFile(
      pagination,
      exportFileDto
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @ApiOkResponse({ type: LeaveRequest })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.leaveRequestService.findOne(id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @Patch(':id')
  @ApiOkResponse({ type: IdResponseDto })
  update(
    @Param('id') id: number,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto
  ) {
    return this.leaveRequestService.update(id, updateLeaveRequestDto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.leaveRequestService.delete(id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(LeaveRequest) })
  @Get('status/enum')
  leaveStatusEnum() {
    return this.leaveRequestService.leaveStatus();
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.READ_LEAVE_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(LeaveRequest) })
  @Get('leave-stock/list')
  getLeaveStock(@Query() paginate: LeaveStockPagination) {
    return this.leaveRequestService.getLeaveStock(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.READ_LEAVE_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(LeaveRequest) })
  @Get('leave-stock/list/detail/:leaveTypeId/:employeeId')
  getLeaveStockDetail(
    @Query() query: any,
    @Param('leaveTypeId') leaveTypeId: number,
    @Param('employeeId') employeeId: number
  ) {
    return this.leaveRequestService.getLeaveStockDetail(
      leaveTypeId,
      employeeId,
      query
    );
  }

  @Post('leave-stock/list/export')
  exportLeaveRemainReportFile(
    @Query()
    pagination: LeaveStockPagination,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.leaveRequestService.exportLeaveRemainReportFile(
      pagination,
      exportFileDto
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.READ_LEAVE_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(LeaveRequest) })
  @Get('payslip/employee/:employeeId/year/:year/month/:month/leave-report')
  leaveReportForPayslip(
    @Param('employeeId') employeeId: number,
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.leaveRequestService.leaveReportForPayslip(
      employeeId,
      year,
      month
    );
  }

  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.READ_LEAVE_REQUEST))
  @Get('duration-type/enum')
  getLeaveDurationTypeEnum() {
    return this.leaveRequestService.getLeaveDurationTypeEnum();
  }
}
