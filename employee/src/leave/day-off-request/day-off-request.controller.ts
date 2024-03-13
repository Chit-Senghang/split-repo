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
import { DAY_OFF_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/day-off-request.enum';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { DayOffRequestService } from './day-off-request.service';
import { CreateDayOffRequestDto } from './dto/create-day-off-request.dto';
import { UpdateDayOffRequestDto } from './dto/update-day-off-request.dto';
import { PaginationDayOffRequestDto } from './dto/pagination-day-off-request.dto';
import { DayOffRequest } from './entities/day-off-request.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('day-off-request')
@Controller('day-off-request')
export class DayOffRequestController {
  constructor(private readonly dayOffRequestService: DayOffRequestService) {}

  @UseGuards(PermissionGuard(DAY_OFF_REQUEST_PERMISSION.CREATE_DAY_OFF_REQUEST))
  @Post()
  @ApiCreatedResponse({ type: IdResponseDto })
  create(@Body() createDayOffRequestDto: CreateDayOffRequestDto) {
    return this.dayOffRequestService.create(createDayOffRequestDto);
  }

  @UseGuards(PermissionGuard(DAY_OFF_REQUEST_PERMISSION.READ_DAY_OFF_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(DayOffRequest) })
  @Get()
  findAll(@Query() pagination: PaginationDayOffRequestDto) {
    return this.dayOffRequestService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationDayOffRequestDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.dayOffRequestService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(DAY_OFF_REQUEST_PERMISSION.READ_DAY_OFF_REQUEST))
  @ApiOkResponse({ type: DayOffRequest })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.dayOffRequestService.findOne(id);
  }

  @UseGuards(PermissionGuard(DAY_OFF_REQUEST_PERMISSION.UPDATE_DAY_OFF_REQUEST))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDayOffRequestDto: UpdateDayOffRequestDto
  ) {
    return this.dayOffRequestService.update(id, updateDayOffRequestDto);
  }

  @UseGuards(PermissionGuard(DAY_OFF_REQUEST_PERMISSION.DELETE_DAY_OFF_REQUEST))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.dayOffRequestService.delete(id);
  }
}
