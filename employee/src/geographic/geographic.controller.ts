import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { GEOGRAPHIC_PERMISSION } from '../shared-resources/ts/enum/permission/employee/geographic.enum';
import { ExportFileDto } from './../shared-resources/export-file/dto/export-file.dto';
import { PaginationGeographicDto } from './dto/pagintation-geographic.dto';
import { Geographic } from './entities/geographic.entity';
import { GeographicService } from './geographic.service';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('geographic')
@Controller('geographic')
export class GeographicController {
  constructor(private readonly geographicService: GeographicService) {}

  @UseGuards(PermissionGuard(GEOGRAPHIC_PERMISSION.READ_GEOGRAPHIC))
  @ApiOkResponse({ type: getPaginationResponseDto(Geographic) })
  @Get()
  findAll(@Query() pagination: PaginationGeographicDto) {
    return this.geographicService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationGeographicDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.geographicService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(GEOGRAPHIC_PERMISSION.READ_GEOGRAPHIC))
  @ApiOkResponse({ type: getPaginationResponseDto(Geographic) })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.geographicService.findOne(id);
  }

  @UseGuards(PermissionGuard(GEOGRAPHIC_PERMISSION.READ_GEOGRAPHIC))
  @ApiOkResponse({ type: getPaginationResponseDto(Geographic) })
  @Get('list/tree')
  listGeographic(@Query('parentId') parentId: number) {
    return this.geographicService.listGeographic(parentId);
  }
}
