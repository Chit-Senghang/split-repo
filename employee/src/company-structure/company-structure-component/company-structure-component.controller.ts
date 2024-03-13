import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  HttpCode,
  UseGuards,
  Put
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { COMPANY_STRUCTURE_COMPONENT_PERMISSION } from '../../shared-resources/ts/enum/permission';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { CreateCompanyStructureComponentDto } from '../dto/components/create-company-structure-component.dto';
import { PaginationQueryCompanyStructureComponentDto } from '../dto/components/pagination-company-structure-component.dto';
import { PermissionGuard } from '../../guards/permission.guard';
import { CompanyStructureComponentService } from './company-structure-component.service';
import { CompanyStructureComponent } from './entities/company-structure-component.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('company-structure-component')
@Controller('company-structure-component')
export class CompanyStructureComponentController {
  constructor(
    private readonly structurePositionService: CompanyStructureComponentService
  ) {}

  @Post()
  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(
      COMPANY_STRUCTURE_COMPONENT_PERMISSION.CREATE_COMPANY_STRUCTURE_COMPONENT
    )
  )
  create(
    @Body() createStructurePositionDto: CreateCompanyStructureComponentDto
  ) {
    return this.structurePositionService.create(createStructurePositionDto);
  }

  @UseGuards(
    PermissionGuard(
      COMPANY_STRUCTURE_COMPONENT_PERMISSION.READ_COMPANY_STRUCTURE_COMPONENT
    )
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructureComponent) })
  @Get()
  findAll(@Query() pagination: PaginationQueryCompanyStructureComponentDto) {
    return this.structurePositionService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryCompanyStructureComponentDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.structurePositionService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(
      COMPANY_STRUCTURE_COMPONENT_PERMISSION.READ_COMPANY_STRUCTURE_COMPONENT
    )
  )
  @ApiOkResponse({ type: CompanyStructureComponent })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.structurePositionService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      COMPANY_STRUCTURE_COMPONENT_PERMISSION.UPDATE_COMPANY_STRUCTURE_COMPONENT
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStructurePositionDto: CreateCompanyStructureComponentDto
  ) {
    return this.structurePositionService.create(updateStructurePositionDto, id);
  }

  @UseGuards(
    PermissionGuard(
      COMPANY_STRUCTURE_COMPONENT_PERMISSION.DELETE_COMPANY_STRUCTURE_COMPONENT
    )
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.structurePositionService.delete(id);
  }
}
