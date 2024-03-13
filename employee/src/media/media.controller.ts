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
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { MEDIA_PERMISSION } from '../shared-resources/ts/enum/permission/authentication/media-permission.enum';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { PaginationMediaDto } from './dto/pagination-media.dto';

@ApiBearerAuth()
@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(MEDIA_PERMISSION.CREATE_MEDIA))
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
  create(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.mediaService.create(createMediaDto, file);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(MEDIA_PERMISSION.READ_MEDIA))
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.mediaService.findOne(id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(MEDIA_PERMISSION.READ_MEDIA))
  @Get()
  findAll(@Query() pagination: PaginationMediaDto) {
    return this.mediaService.findAll(pagination);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(PermissionGuard(MEDIA_PERMISSION.DELETE_MEDIA))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.mediaService.deleteFile(id);
  }

  @UseGuards(PermissionGuard(MEDIA_PERMISSION.UPDATE_MEDIA))
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  update(
    @Param('id') id: number,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.mediaService.update(id, file);
  }

  @Get('/download/:filename')
  download(@Param('filename') filename: string) {
    return this.mediaService.download(filename);
  }
}
