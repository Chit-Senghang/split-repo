import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
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
import { PermissionGuard } from '../../guards/permission.guard';
import { PUBLIC_HOLIDAY_PERMISSION } from '../../shared-resources/ts/enum/permission';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PublicHolidayService } from './public-holiday.service';
import { CreatePublicHolidayDto } from './dto/create-public-holiday.dto';
import { UpdatePublicHolidayDto } from './dto/update-public-holiday.dto';
import { PaginationQueryPublicHolidayDto } from './dto/pagination-query-public-holiday.dto';
import { PublicHoliday } from './entities/public-holiday.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('public-holiday')
@UseInterceptors(ResponseMappingInterceptor)
@Controller('public-holiday')
export class PublicHolidayController {
  constructor(private readonly publicHolidayService: PublicHolidayService) {}

  @UseGuards(PermissionGuard(PUBLIC_HOLIDAY_PERMISSION.CREATE_PUBLIC_HOLIDAY))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createPublicHolidayDto: CreatePublicHolidayDto) {
    return this.publicHolidayService.create(createPublicHolidayDto);
  }

  @UseGuards(PermissionGuard(PUBLIC_HOLIDAY_PERMISSION.READ_PUBLIC_HOLIDAY))
  @ApiOkResponse({ type: getPaginationResponseDto(PublicHoliday) })
  @Get()
  findAll(@Query() pagination: PaginationQueryPublicHolidayDto) {
    return this.publicHolidayService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryPublicHolidayDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.publicHolidayService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(PUBLIC_HOLIDAY_PERMISSION.READ_PUBLIC_HOLIDAY))
  @ApiOkResponse({ type: PublicHoliday })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.publicHolidayService.findOne(id);
  }

  @UseGuards(PermissionGuard(PUBLIC_HOLIDAY_PERMISSION.UPDATE_PUBLIC_HOLIDAY))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePublicHolidayDto: UpdatePublicHolidayDto
  ) {
    return this.publicHolidayService.update(id, updatePublicHolidayDto);
  }

  @UseGuards(PermissionGuard(PUBLIC_HOLIDAY_PERMISSION.DELETE_PUBLIC_HOLIDAY))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.publicHolidayService.delete(id);
  }
}
