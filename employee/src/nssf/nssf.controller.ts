import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  Patch,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { NssfService } from './nssf.service';
import { NssfPaginate } from './dto/paginate-nssf.dto';
import { UpdateNssfDto } from './dto/update-nssf.dto';

@ApiTags('nssf')
@Controller('nssf')
export class NssfController {
  constructor(private readonly nssfService: NssfService) {}

  @Post('downloadExcel')
  getExcel() {
    return this.nssfService.downLoadExcel();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload/excel')
  createNSSF(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.nssfService.createNSSF(file);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @Get()
  findAll(@Query() paginate: NssfPaginate) {
    return this.nssfService.findAll(paginate);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nssfService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNssfDto: UpdateNssfDto) {
    return this.nssfService.update(+id, updateNssfDto);
  }
}
