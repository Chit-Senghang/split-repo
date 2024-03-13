import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors
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
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { ExportFileDto } from './../shared-resources/export-file/dto/export-file.dto';
import { CodeValuePermissionGuard } from './../guards/code-value-permission.guard';
import { CodeValueService } from './code-value.service';
import { CreateCodeValueDto } from './dto/create-code-value.dto';
import { UpdateCodeValueDto } from './dto/update-code-value.dto';
import { PaginationCodeValueDto } from './dto/pagination-code-value.dto';
import { CodeValue } from './entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiBearerAuth()
@ApiTags('code-value')
@Controller('code-value')
export class CodeValueController {
  constructor(private readonly codeValueService: CodeValueService) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(CodeValuePermissionGuard('CREATE'))
  @Post()
  createCodeValue(
    @Query() pagination: PaginationCodeValueDto,
    @Body() createCodeValue: CreateCodeValueDto
  ) {
    return this.codeValueService.createCodeValue(pagination, createCodeValue);
  }

  @ApiOkResponse({ type: IdResponseDto })
  @UseGuards(CodeValuePermissionGuard('UPDATE'))
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Query() pagination: PaginationCodeValueDto,
    @Body() updateCodeValue: UpdateCodeValueDto
  ) {
    return this.codeValueService.updateCodeValue(
      id,
      pagination,
      updateCodeValue
    );
  }

  @ApiOkResponse({ type: CodeValue })
  @UseGuards(CodeValuePermissionGuard('READ'))
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Query() pagination: PaginationCodeValueDto
  ) {
    return this.codeValueService.findOne(id, pagination);
  }

  @ApiOkResponse({ type: getPaginationResponseDto(CodeValue) })
  @UseGuards(CodeValuePermissionGuard('READ'))
  @Get()
  findAll(@Query() pagination: PaginationCodeValueDto) {
    return this.codeValueService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationCodeValueDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.codeValueService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(CodeValuePermissionGuard('DELETE'))
  @Delete(':id')
  @HttpCode(204)
  delete(@Query() pagination: PaginationCodeValueDto, @Param('id') id: number) {
    return this.codeValueService.delete(id, pagination);
  }
}
