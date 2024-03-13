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
  ParseIntPipe,
  UseInterceptors,
  UseGuards
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
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { SALARY_COMPONENT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/salary-component.enum';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { BenefitComponentService } from './benefit-component.service';
import { CreateBenefitComponentDto } from './dto/create-benefit-component.dto';
import { UpdateBenefitComponentDto } from './dto/update-benefit-component.dto';
import { PaginationBenefitComponentDto } from './dto/pagination-benefit-component.dto';
import { BenefitComponent } from './entities/benefit-component.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('benefit-component')
@Controller('benefit-component')
export class SalaryComponentController {
  constructor(
    private readonly benefitComponentService: BenefitComponentService
  ) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(SALARY_COMPONENT_PERMISSION.CREATE_BENEFIT_COMPONENT)
  )
  @Post()
  create(@Body() createSalaryComponentDto: CreateBenefitComponentDto) {
    return this.benefitComponentService.create(createSalaryComponentDto);
  }

  @ApiOkResponse({ type: getPaginationResponseDto(BenefitComponent) })
  @UseGuards(
    PermissionGuard(SALARY_COMPONENT_PERMISSION.READ_BENEFIT_COMPONENT)
  )
  @Get()
  findAll(@Query() pagination: PaginationBenefitComponentDto) {
    return this.benefitComponentService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationBenefitComponentDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.benefitComponentService.exportFile(pagination, exportFileDto);
  }

  @ApiOkResponse({ type: BenefitComponent })
  @UseGuards(
    PermissionGuard(SALARY_COMPONENT_PERMISSION.READ_BENEFIT_COMPONENT)
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.benefitComponentService.findOne(id);
  }

  @ApiOkResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(SALARY_COMPONENT_PERMISSION.UPDATE_BENEFIT_COMPONENT)
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryComponentDto: UpdateBenefitComponentDto
  ) {
    return this.benefitComponentService.update(id, updateSalaryComponentDto);
  }

  @UseGuards(
    PermissionGuard(SALARY_COMPONENT_PERMISSION.DELETE_BENEFIT_COMPONENT)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.benefitComponentService.delete(id);
  }
}
