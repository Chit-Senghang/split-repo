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
  Query
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
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../../guards/permission.guard';
import { ATTENDANCE_RECORD_PERMISSION } from '../../shared-resources/ts/enum/permission';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { AttendanceRecordService } from './attendance-record.service';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { UpdateAttendanceRecordDto } from './dto/update-attendance-record.dto';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { PaginationQueryAttendanceRecordDto } from './dto/pagination-query-attendance-record.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('attendance-record')
@Controller('attendance-record')
export class AttendanceRecordController {
  constructor(
    private readonly attendanceRecordService: AttendanceRecordService
  ) {}

  @UseGuards(
    PermissionGuard(ATTENDANCE_RECORD_PERMISSION.CREATE_ATTENDANCE_RECORD)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createAttendanceRecordDto: CreateAttendanceRecordDto) {
    return this.attendanceRecordService.create(createAttendanceRecordDto);
  }

  @UseGuards(
    PermissionGuard(ATTENDANCE_RECORD_PERMISSION.READ_ATTENDANCE_RECORD)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(AttendanceRecord) })
  @Get()
  findAll(@Query() pagination: PaginationQueryAttendanceRecordDto) {
    return this.attendanceRecordService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryAttendanceRecordDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.attendanceRecordService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(ATTENDANCE_RECORD_PERMISSION.READ_ATTENDANCE_RECORD)
  )
  @ApiOkResponse({ type: AttendanceRecord })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.attendanceRecordService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(ATTENDANCE_RECORD_PERMISSION.UPDATE_ATTENDANCE_RECORD)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateAttendanceRecordDto: UpdateAttendanceRecordDto
  ) {
    return this.attendanceRecordService.update(id, updateAttendanceRecordDto);
  }

  @UseGuards(
    PermissionGuard(ATTENDANCE_RECORD_PERMISSION.DELETE_ATTENDANCE_RECORD)
  )
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.attendanceRecordService.delete(id);
  }

  @UseGuards(
    PermissionGuard(ATTENDANCE_RECORD_PERMISSION.READ_ATTENDANCE_RECORD)
  )
  @Get('record/:id')
  getLatestRecord(@Param('id') id: number) {
    return this.attendanceRecordService.findLatestRecord(id);
  }
}
