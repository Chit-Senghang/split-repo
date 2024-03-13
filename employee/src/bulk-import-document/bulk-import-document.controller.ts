import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { BULK_IMPORT_DOCUMENT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/bulk-import-document.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { BulkImportDocumentPaginationDto } from './dto/bulk-import-document-pagination.dto';
import { BulkTypeEnum } from './enum/type.enum';
import { BulkImportBodyDto } from './dto/bulk-import-body.dto';
import { BulkImportDocumentService } from './bulk-import-document.service';

@ApiTags('bulk-import-document')
@Controller('bulk-import-document')
export class BulkImportDocumentController {
  constructor(
    private readonly bulkImportDocumentService: BulkImportDocumentService
  ) {}

  @UseGuards(
    PermissionGuard(BULK_IMPORT_DOCUMENT_PERMISSION.CREATE_BULK_IMPORT_DOCUMENT)
  )
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entityType: { type: 'string' },
        entityId: {
          type: 'number',
          format: 'integer'
        },
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() entityType: BulkImportBodyDto
  ) {
    return this.bulkImportDocumentService.import(file, entityType);
  }

  @UseGuards(
    PermissionGuard(BULK_IMPORT_DOCUMENT_PERMISSION.READ_BULK_IMPORT_DOCUMENT)
  )
  @Get('download-template/:entity')
  getTemplateFile(
    @Param('entity') entityType: BulkTypeEnum,
    @Query('companyStructureId') companyStructureId: number
  ) {
    return this.bulkImportDocumentService.download(
      entityType,
      companyStructureId
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(BULK_IMPORT_DOCUMENT_PERMISSION.READ_BULK_IMPORT_DOCUMENT)
  )
  @Get()
  findAll(@Query() pagination: BulkImportDocumentPaginationDto) {
    return this.bulkImportDocumentService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: BulkImportDocumentPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.bulkImportDocumentService.exportFile(pagination, exportFileDto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(BULK_IMPORT_DOCUMENT_PERMISSION.READ_BULK_IMPORT_DOCUMENT)
  )
  @Get('support-entity')
  getSupportedUploadEntity() {
    return this.bulkImportDocumentService.getSupportedUploadEntity();
  }
}
