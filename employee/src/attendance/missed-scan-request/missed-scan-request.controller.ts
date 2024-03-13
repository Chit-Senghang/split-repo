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
import { MISSED_SCAN_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/missed-scan-request.enum';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PaginationQueryMissedScanRequestDto } from './dto/pagination-query-missed-scan-request.dto';
import { CreateMissedScanRequestDto } from './dto/create-missed-scan-request.dto';
import { MissedScanRequest } from './entities/missed-scan-request.entity';
import { UpdateMissedScanRequestDto } from './dto/update-missed-scan-request.dto';
import { MissedScanRequestService } from './missed-scan-request.service';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('missed-scan-request')
@UseInterceptors(ResponseMappingInterceptor)
@Controller('missed-scan-request')
export class MissedScanRequestController {
  constructor(
    private readonly missedScanRequestService: MissedScanRequestService
  ) {}

  @UseGuards(
    PermissionGuard(MISSED_SCAN_REQUEST_PERMISSION.CREATE_MISSED_SCAN_REQUEST)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createMissedScanRequestDto: CreateMissedScanRequestDto) {
    return this.missedScanRequestService.create(createMissedScanRequestDto);
  }

  @UseGuards(
    PermissionGuard(MISSED_SCAN_REQUEST_PERMISSION.READ_MISSED_SCAN_REQUEST)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(MissedScanRequest) })
  @Get()
  findAll(@Query() pagination: PaginationQueryMissedScanRequestDto) {
    return this.missedScanRequestService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryMissedScanRequestDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.missedScanRequestService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(MISSED_SCAN_REQUEST_PERMISSION.READ_MISSED_SCAN_REQUEST)
  )
  @ApiOkResponse({ type: MissedScanRequest })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.missedScanRequestService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(MISSED_SCAN_REQUEST_PERMISSION.UPDATE_MISSED_SCAN_REQUEST)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMissedScanRequestDto: UpdateMissedScanRequestDto
  ) {
    return this.missedScanRequestService.update(id, updateMissedScanRequestDto);
  }

  @UseGuards(
    PermissionGuard(MISSED_SCAN_REQUEST_PERMISSION.DELETE_MISSED_SCAN_REQUEST)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.missedScanRequestService.delete(id);
  }
}
