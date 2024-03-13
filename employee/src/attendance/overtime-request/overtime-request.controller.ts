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
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../../guards/permission.guard';
import { OVERTIME_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/overtime-request.enum';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { OvertimeRequestType } from '../overtime-request-type/entities/overtime-request-type.entity';
import { OvertimeRequestService } from './overtime-request.service';
import { CreateOvertimeRequestDto } from './dto/create-overtime_request.dto';
import { UpdateOvertimeRequestDto } from './dto/update-overtime-request.dto';
import { PaginationQueryOvertimeRequestDto } from './dto/pagination-query-overtime-request';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('overtime-request')
@Controller('overtime-request')
@UseInterceptors(ResponseMappingInterceptor)
export class OvertimeRequestController {
  constructor(
    private readonly overtimeRequestService: OvertimeRequestService
  ) {}

  @UseGuards(
    PermissionGuard(OVERTIME_REQUEST_PERMISSION.CREATE_OVERTIME_REQUEST)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createOvertimeRequestDto: CreateOvertimeRequestDto) {
    return this.overtimeRequestService.create(createOvertimeRequestDto);
  }

  @UseGuards(PermissionGuard(OVERTIME_REQUEST_PERMISSION.READ_OVERTIME_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(OvertimeRequestType) })
  @Get()
  findAll(@Query() pagination: PaginationQueryOvertimeRequestDto) {
    return this.overtimeRequestService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryOvertimeRequestDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.overtimeRequestService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(OVERTIME_REQUEST_PERMISSION.READ_OVERTIME_REQUEST))
  @ApiOkResponse({ type: OvertimeRequestType })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.overtimeRequestService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(OVERTIME_REQUEST_PERMISSION.UPDATE_OVERTIME_REQUEST)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateOvertimeRequestDto: UpdateOvertimeRequestDto
  ) {
    return this.overtimeRequestService.update(id, updateOvertimeRequestDto);
  }

  @UseGuards(
    PermissionGuard(OVERTIME_REQUEST_PERMISSION.DELETE_OVERTIME_REQUEST)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.overtimeRequestService.delete(id);
  }
}
