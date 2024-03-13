import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
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
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { VACCINATION_NAME_PERMISSION } from '../shared-resources/ts/enum/permission';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { VaccinationService } from './vaccination.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { VaccinationPaginationDto } from './dto/pagination-vaccination.dto';
import { Vaccination } from './entities/vaccination.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('vaccination')
@Controller('vaccination')
export class VaccinationController {
  constructor(private readonly vaccinationNameService: VaccinationService) {}

  @UseGuards(
    PermissionGuard(VACCINATION_NAME_PERMISSION.CREATE_VACCINATION_NAME)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createVaccinationNameDto: CreateVaccinationDto) {
    return this.vaccinationNameService.create(createVaccinationNameDto);
  }

  @UseGuards(PermissionGuard(VACCINATION_NAME_PERMISSION.READ_VACCINATION_NAME))
  @ApiOkResponse({ type: getPaginationResponseDto(Vaccination) })
  @Get()
  findAll(@Query() pagination: VaccinationPaginationDto) {
    return this.vaccinationNameService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: VaccinationPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.vaccinationNameService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(VACCINATION_NAME_PERMISSION.READ_VACCINATION_NAME))
  @ApiOkResponse({ type: Vaccination })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.vaccinationNameService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(VACCINATION_NAME_PERMISSION.UPDATE_VACCINATION_NAME)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateVaccinationNameDto: UpdateVaccinationDto
  ) {
    return this.vaccinationNameService.update(id, updateVaccinationNameDto);
  }

  @UseGuards(
    PermissionGuard(VACCINATION_NAME_PERMISSION.UPDATE_VACCINATION_NAME)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.vaccinationNameService.delete(id);
  }
}
