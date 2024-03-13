import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { Express } from 'express';
import { PermissionGuard } from '../guards/permission.guard';
import { LEAVE_REQUEST_PERMISSION } from '../shared-resources/ts/enum/permission/leave/leave-request-permission.enum';
import { MigrationDataService } from './migration-data.service';

@Controller('migration-data')
export class MigrationDataController {
  constructor(private readonly migrationDataService: MigrationDataService) {}

  @UseGuards(PermissionGuard(LEAVE_REQUEST_PERMISSION.CREATE_LEAVE_REQUEST))
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.migrationDataService.create(file);
  }
}
