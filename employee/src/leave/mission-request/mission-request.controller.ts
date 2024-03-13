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
import { MISSION_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/mission-request-permission.enum';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { MissionRequestService } from './mission-request.service';
import { CreateMissionRequestDto } from './dto/create-mission-request.dto';
import { PaginationQueryMissionRequestDto } from './dto/pagination-query-mission-request.dto';
import { MissionRequest } from './entities/mission-request.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiTags('mission-request')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@Controller('mission-request')
export class MissionRequestController {
  constructor(private readonly missionRequestService: MissionRequestService) {}

  @UseGuards(PermissionGuard(MISSION_REQUEST_PERMISSION.CREATE_MISSION_REQUEST))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createMissionRequestDto: CreateMissionRequestDto) {
    return this.missionRequestService.create(createMissionRequestDto);
  }

  @UseGuards(PermissionGuard(MISSION_REQUEST_PERMISSION.READ_MISSION_REQUEST))
  @ApiOkResponse({ type: getPaginationResponseDto(MissionRequest) })
  @Get()
  findAll(@Query() pagination: PaginationQueryMissionRequestDto) {
    return this.missionRequestService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryMissionRequestDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.missionRequestService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(MISSION_REQUEST_PERMISSION.READ_MISSION_REQUEST))
  @ApiOkResponse({ type: MissionRequest })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.missionRequestService.findOne(id);
  }

  @UseGuards(PermissionGuard(MISSION_REQUEST_PERMISSION.UPDATE_MISSION_REQUEST))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMissionRequestDto: CreateMissionRequestDto
  ) {
    return this.missionRequestService.update(id, updateMissionRequestDto);
  }

  @UseGuards(PermissionGuard(MISSION_REQUEST_PERMISSION.DELETE_MISSION_REQUEST))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.missionRequestService.delete(id);
  }

  @UseGuards(PermissionGuard(MISSION_REQUEST_PERMISSION.READ_MISSION_REQUEST))
  @ApiOkResponse({ type: MissionRequest })
  @Get('duration-type/enum')
  getMissionRequestEnum() {
    return this.missionRequestService.getMissionRequestDurationTypeEnum();
  }
}
