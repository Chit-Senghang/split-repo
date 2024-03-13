import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  UseGuards,
  HttpCode
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { SALARY_COMPONENT_TYPE_PERMISSION } from '../shared-resources/ts/enum/permission/payroll/salary-component-type.enum';
import { SalaryComponentTypeService } from './benefit-component-type.service';
import { CreateSalaryComponentTypeDto } from './dto/create-benefit-component-type.dto';
import { UpdateSalaryComponentTypeDto } from './dto/update-benefit-component-type.dto';
import { PaginationQuerySalaryComponentTypeDto } from './dto/pagination-query-benefit-component-type';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('benefit-component-type')
@Controller('benefit-component-type')
export class SalaryComponentTypeController {
  constructor(
    private readonly salaryComponentTypeService: SalaryComponentTypeService
  ) {}

  @UseGuards(
    PermissionGuard(
      SALARY_COMPONENT_TYPE_PERMISSION.CREATE_BENEFIT_COMPONENT_TYPE
    )
  )
  @Post()
  create(@Body() createSalaryComponentTypeDto: CreateSalaryComponentTypeDto) {
    return this.salaryComponentTypeService.create(createSalaryComponentTypeDto);
  }

  @UseGuards(
    PermissionGuard(
      SALARY_COMPONENT_TYPE_PERMISSION.READ_BENEFIT_COMPONENT_TYPE
    )
  )
  @Get()
  findAll(@Query() pagination: PaginationQuerySalaryComponentTypeDto) {
    return this.salaryComponentTypeService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQuerySalaryComponentTypeDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.salaryComponentTypeService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(
    PermissionGuard(
      SALARY_COMPONENT_TYPE_PERMISSION.READ_BENEFIT_COMPONENT_TYPE
    )
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.salaryComponentTypeService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      SALARY_COMPONENT_TYPE_PERMISSION.UPDATE_BENEFIT_COMPONENT_TYPE
    )
  )
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateSalaryComponentTypeDto: UpdateSalaryComponentTypeDto
  ) {
    return this.salaryComponentTypeService.update(
      id,
      updateSalaryComponentTypeDto
    );
  }

  @UseGuards(
    PermissionGuard(
      SALARY_COMPONENT_TYPE_PERMISSION.DELETE_BENEFIT_COMPONENT_TYPE
    )
  )
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: number) {
    return this.salaryComponentTypeService.delete(id);
  }
}
