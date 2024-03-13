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
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { AUDIT_LOG_PERMISSION } from '../shared-resources/ts/enum/permission';
import { PermissionGuard } from '../common/guards/permission.guard';
import { AuditLoggingService } from './audit-logging.service';
import { AuditLoggingPaginationDto } from './dto/audit-logging-pagination.dto';
import { AuditLog } from './entities/audit-logging.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('audit-logging')
@Controller('audit-logging')
export class AuditLoggingController {
  constructor(private readonly auditLoggingService: AuditLoggingService) {}

  @Get()
  @ApiOkResponse({ type: getPaginationResponseDto(AuditLog) })
  @UseGuards(PermissionGuard(AUDIT_LOG_PERMISSION.READ_AUDIT_LOG))
  findAll(@Query() pagination: AuditLoggingPaginationDto) {
    return this.auditLoggingService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: AuditLoggingPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.auditLoggingService.exportFile(pagination, exportFileDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: AuditLog })
  @UseGuards(PermissionGuard(AUDIT_LOG_PERMISSION.READ_AUDIT_LOG))
  findOne(@Param('id') id: number) {
    return this.auditLoggingService.findOne(id);
  }
}
