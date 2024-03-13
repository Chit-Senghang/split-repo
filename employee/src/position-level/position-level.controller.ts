import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PositionLevelPermissionEnum } from '../shared-resources/ts/enum/permission/employee/position-level.enum';
import { PermissionGuard } from '../guards/permission.guard';
import { PositionLevelService } from './position-level.service';
import { CreatePositionLevelDto } from './dto/create-position-level.dto';
import { UpdatePositionLevelDto } from './dto/update-position-level.dto';
import { PositionLevelPaginationDto } from './dto/pagination-position-level.dto';
import { PositionLevel } from './entities/position-level.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('position-level')
@Controller('position-level')
export class PositionLevelController {
  constructor(private readonly positionLevelService: PositionLevelService) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  @UseGuards(PermissionGuard(PositionLevelPermissionEnum.CREATE_POSITION_LEVEL))
  create(@Body() createPositionLevelDto: CreatePositionLevelDto) {
    return this.positionLevelService.create(createPositionLevelDto);
  }

  @ApiOkResponse({ type: getPaginationResponseDto(PositionLevel) })
  @Get()
  @UseGuards(PermissionGuard(PositionLevelPermissionEnum.READ_POSITION_LEVEL))
  findAll(@Query() pagination: PositionLevelPaginationDto) {
    return this.positionLevelService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PositionLevelPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.positionLevelService.exportFile(pagination, exportFileDto);
  }

  @ApiOkResponse({ type: PositionLevel })
  @Get(':id')
  @UseGuards(PermissionGuard(PositionLevelPermissionEnum.READ_POSITION_LEVEL))
  findOne(@Param('id') id: number) {
    return this.positionLevelService.findOne(id);
  }

  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  @UseGuards(PermissionGuard(PositionLevelPermissionEnum.UPDATE_POSITION_LEVEL))
  update(
    @Param('id') id: number,
    @Body() updatePositionLevelDto: UpdatePositionLevelDto
  ) {
    return this.positionLevelService.update(id, updatePositionLevelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionGuard(PositionLevelPermissionEnum.DELETE_POSITION_LEVEL))
  delete(@Param('id') id: number) {
    return this.positionLevelService.delete(id);
  }
}
