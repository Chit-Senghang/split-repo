import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  UseInterceptors,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../../guards/permission.guard';
import { WORKING_SHIFT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/working-shift.enum';
import { WorkingShift } from '../entities/working-shift.entity';
import { ExportFileDto } from './../../shared-resources/export-file/dto/export-file.dto';
import { WorkingShiftService } from './working-shift.service';
import { CreateWorkingShiftDto } from './dto/create-working-shift.dto';
import { UpdateWorkingShiftDto } from './dto/update-working-shift.dto';
import { PaginationWorkShiftDto } from './dto/pagination-workingshift.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('working-shift')
@Controller('working-shift')
export class WorkingShiftController {
  constructor(private readonly workingShiftService: WorkingShiftService) {}

  @UseGuards(PermissionGuard(WORKING_SHIFT_PERMISSION.CREATE_WORKING_SHIFT))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createWorkingShiftDto: CreateWorkingShiftDto) {
    return this.workingShiftService.create(createWorkingShiftDto);
  }

  @UseGuards(PermissionGuard(WORKING_SHIFT_PERMISSION.READ_WORKING_SHIFT))
  @ApiOkResponse({ type: getPaginationResponseDto(WorkingShift) })
  @Get()
  findAll(@Query() pagination: PaginationWorkShiftDto) {
    return this.workingShiftService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationWorkShiftDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.workingShiftService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(WORKING_SHIFT_PERMISSION.READ_WORKING_SHIFT))
  @ApiOkResponse({ type: WorkingShift })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.workingShiftService.findOne(id);
  }

  @UseGuards(PermissionGuard(WORKING_SHIFT_PERMISSION.UPDATE_WORKING_SHIFT))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateWorkingShiftDto: UpdateWorkingShiftDto
  ) {
    return this.workingShiftService.update(id, updateWorkingShiftDto);
  }

  @UseGuards(PermissionGuard(WORKING_SHIFT_PERMISSION.DELETE_WORKING_SHIFT))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.workingShiftService.delete(id);
  }
}
