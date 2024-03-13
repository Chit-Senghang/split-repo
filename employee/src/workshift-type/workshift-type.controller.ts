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
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { WORKSHIFT_TYPE_PERMISSION } from '../shared-resources/ts/enum/permission/employee/workshift-type.enum';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { WorkShiftTypeService } from './workshift-type.service';
import { UpdateWorkshiftTypeDto as UpdateWorkShiftTypeDto } from './dto/update-workshift-type.dto';
import { PaginationWorkShiftTypeDto } from './dto/pagination-workshift-type.dto';
import { WorkshiftType } from './entities/workshift-type.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('workshift-type')
@Controller('workshift-type')
export class WorkShiftTypeController {
  constructor(private readonly workshiftTypeService: WorkShiftTypeService) {}

  @UseGuards(PermissionGuard(WORKSHIFT_TYPE_PERMISSION.READ_WORKSHIFT_TYPE))
  @ApiOkResponse({ type: getPaginationResponseDto(WorkshiftType) })
  @Get()
  findAll(@Query() pagination: PaginationWorkShiftTypeDto) {
    return this.workshiftTypeService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationWorkShiftTypeDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.workshiftTypeService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(WORKSHIFT_TYPE_PERMISSION.READ_WORKSHIFT_TYPE))
  @ApiOkResponse({ type: WorkshiftType })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.workshiftTypeService.findOne(id);
  }

  @UseGuards(PermissionGuard(WORKSHIFT_TYPE_PERMISSION.UPDATE_WORKSHIFT_TYPE))
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateWorkShiftTypeDto: UpdateWorkShiftTypeDto
  ) {
    return this.workshiftTypeService.update(id, updateWorkShiftTypeDto);
  }
}
