import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UseGuards
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { FingerPrintDeviceService } from './finger-print-device.service';
import { CreateFingerPrintDeviceDto } from './dto/create-finger-print-device.dto';
import { UpdateFingerPrintDeviceDto } from './dto/update-finger-print-device.dto';
import { FingerPrintPaginationDto } from './dto/finger-print-paginate.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('finger-print-device')
@Controller('finger-print-device')
export class FingerPrintDeviceController {
  constructor(
    private readonly fingerPrintDeviceService: FingerPrintDeviceService
  ) {}

  @UseGuards(PermissionGuard('CREATE_FINGER_PRINT_DEVICE'))
  @Post()
  create(@Body() createFingerPrintDeviceDto: CreateFingerPrintDeviceDto) {
    return this.fingerPrintDeviceService.create(createFingerPrintDeviceDto);
  }

  @UseGuards(PermissionGuard('READ_FINGER_PRINT_DEVICE'))
  @Get()
  findAll(@Query() paginate: FingerPrintPaginationDto) {
    return this.fingerPrintDeviceService.findAll(paginate);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: FingerPrintPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.fingerPrintDeviceService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard('READ_FINGER_PRINT_DEVICE'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fingerPrintDeviceService.findOne(+id);
  }

  @UseGuards(PermissionGuard('UPDATE_FINGER_PRINT_DEVICE'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFingerPrintDeviceDto: UpdateFingerPrintDeviceDto
  ) {
    return this.fingerPrintDeviceService.update(
      +id,
      updateFingerPrintDeviceDto
    );
  }

  @UseGuards(PermissionGuard('DELETE_FINGER_PRINT_DEVICE'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fingerPrintDeviceService.remove(+id);
  }
}
