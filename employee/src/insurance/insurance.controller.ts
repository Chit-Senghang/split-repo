import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
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
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { INSURANCE_PERMISSION } from '../shared-resources/ts/enum/permission/employee/insurance.enum';
import { InsuranceService } from './insurance.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { InsurancePaginationQueryDto } from './dto/pagination-insurance.dto';
import { Insurance } from './entities/insurance.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('insurance')
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @UseGuards(PermissionGuard(INSURANCE_PERMISSION.CREATE_INSURANCE))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createInsuranceDto: CreateInsuranceDto) {
    return this.insuranceService.create(createInsuranceDto);
  }

  @UseGuards(PermissionGuard(INSURANCE_PERMISSION.READ_INSURANCE))
  @ApiOkResponse({ type: getPaginationResponseDto(Insurance) })
  @Get()
  findAll(@Query() insurancePaginationDto: InsurancePaginationQueryDto) {
    return this.insuranceService.findAll(insurancePaginationDto);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: InsurancePaginationQueryDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.insuranceService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(PermissionGuard(INSURANCE_PERMISSION.READ_INSURANCE))
  @ApiOkResponse({ type: Insurance })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.insuranceService.findOne(id);
  }

  @UseGuards(PermissionGuard(INSURANCE_PERMISSION.UPDATE_INSURANCE))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateInsuranceDto: UpdateInsuranceDto
  ) {
    return this.insuranceService.update(id, updateInsuranceDto);
  }

  @UseGuards(PermissionGuard(INSURANCE_PERMISSION.DELETE_INSURANCE))
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.insuranceService.delete(id);
  }
}
