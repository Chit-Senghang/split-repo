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
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { REASON_TEPLATE_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/reason-template.enum';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ReasonTemplateService } from './reason-template.service';
import { CreateReasonTemplateDto } from './dto/create-reason-template.dto';
import { UpdateReasonTemplateDto } from './dto/update-reason-template.dto';
import { ReasonTemplate } from './entities/reason-template.entity';
import { PaginationReasonTemplateDto } from './dto/pagination-reason-template.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('reason-template')
@Controller('reason-template')
export class ReasonTemplateController {
  constructor(private readonly reasonTemplateService: ReasonTemplateService) {}

  @UseGuards(PermissionGuard(REASON_TEPLATE_PERMISSION.CREATE_REASON_TEPLATE))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createReasonTemplateDto: CreateReasonTemplateDto) {
    return this.reasonTemplateService.create(createReasonTemplateDto);
  }

  @UseGuards(PermissionGuard(REASON_TEPLATE_PERMISSION.READ_REASON_TEPLATE))
  @ApiOkResponse({ type: getPaginationResponseDto(ReasonTemplate) })
  @Get()
  findAll(@Query() pagination: PaginationReasonTemplateDto) {
    return this.reasonTemplateService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationReasonTemplateDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.reasonTemplateService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(REASON_TEPLATE_PERMISSION.READ_REASON_TEPLATE))
  @ApiOkResponse({ type: ReasonTemplate })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.reasonTemplateService.findOne(id);
  }

  @UseGuards(PermissionGuard(REASON_TEPLATE_PERMISSION.UPDATE_REASON_TEPLATE))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateReasonTemplateDto: UpdateReasonTemplateDto
  ) {
    return this.reasonTemplateService.update(id, updateReasonTemplateDto);
  }

  @UseGuards(PermissionGuard(REASON_TEPLATE_PERMISSION.DELETE_REASON_TEPLATE))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.reasonTemplateService.delete(id);
  }
}
