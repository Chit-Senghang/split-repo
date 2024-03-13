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
  HttpCode,
  ParseIntPipe,
  Put
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { COMPANY_STRUCTURE_PERMISSION } from '../shared-resources/ts/enum/permission';
import { PermissionGuard } from '../guards/permission.guard';
import { CompanyStructureService } from './company-structure.service';
import { CreateCompanyStructureDto } from './dto/create-company-structure.dto';
import { UpdateCompanyStructureDto } from './dto/update-company-structure.dto';
import { PaginationQueryCompanyStructureDto } from './dto/pagination-company-structure';
import { CompanyStructure } from './entities/company-structure.entity';
import { DuplicateCompanyStructureDto } from './dto/duplicate-company-structure.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('company-structure')
@Controller('company-structure')
export class CompanyStructureController {
  constructor(
    private readonly companyStructureService: CompanyStructureService
  ) {}

  @Post()
  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.CREATE_COMPANY_STRUCTURE)
  )
  create(@Body() createCompanyStructureDto: CreateCompanyStructureDto) {
    return this.companyStructureService.create(createCompanyStructureDto);
  }

  @Post('/department/:companyStructureDepartmentId/duplicate')
  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.CREATE_COMPANY_STRUCTURE)
  )
  duplicateDepartmentToStores(
    @Param('companyStructureDepartmentId') companyStructureDepartmentId: number,
    @Body() duplicateCompanyStructureDto: DuplicateCompanyStructureDto
  ) {
    return this.companyStructureService.duplicateDepartmentToStores(
      companyStructureDepartmentId,
      duplicateCompanyStructureDto
    );
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get()
  findAll(@Query() pagination: PaginationQueryCompanyStructureDto) {
    return this.companyStructureService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryCompanyStructureDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.companyStructureService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('list')
  listCompanyStructureTree(@Query('isShowPosition') isShowPosition: boolean) {
    return this.companyStructureService.listCompanyStructureTree(
      isShowPosition
    );
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('list/organization')
  async listOrganizationChart() {
    return await this.companyStructureService.listOrganizationChartNewVersion();
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('list/organization/outlet/:id')
  async listOrganizationChartByOutlet(@Param('id', ParseIntPipe) id: number) {
    return await this.companyStructureService.listOrganizationChartByOutlet(id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('department/structure/:id')
  listStructureDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.companyStructureService.listTeamsByDepartmentId(id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('department/hq')
  listDepartmentsOfHq() {
    return this.companyStructureService.listDepartmentOfHq();
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('department/:id/structure/team')
  listTeamsUnderDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.companyStructureService.listTeamsUnderDepartmentByDepartmentId(
      id
    );
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('department/hq/team')
  listTeamInDepartment() {
    return this.companyStructureService.listAllTeamInHq();
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('outlet/:id/team')
  listTeamInOutlet(
    @Param('id') outletId: number,
    @Query() pagination: PaginationQueryCompanyStructureDto
  ) {
    return this.companyStructureService.listTeamsInByOutletId(
      outletId,
      pagination
    );
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('department-or-team/:id')
  listCompanyStructureByParentId(@Param('id', ParseIntPipe) id: number) {
    return this.companyStructureService.listTeamInDepartmentOrPositionInTeam(
      id
    );
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: CompanyStructure })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.companyStructureService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(CompanyStructure) })
  @Get('list/:id')
  listCompanyStructureTreeByParentId(@Param('id', ParseIntPipe) id: number) {
    return this.companyStructureService.listCompanyStructureTreeByParentId(id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.UPDATE_COMPANY_STRUCTURE)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateCompanyStructureDto: CreateCompanyStructureDto
  ) {
    return this.companyStructureService.create(updateCompanyStructureDto, id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.DELETE_COMPANY_STRUCTURE)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.companyStructureService.delete(id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @Get('/outlet/:type')
  getOutlets(@Param('type') type: string) {
    return this.companyStructureService.getOutlets(type);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.READ_COMPANY_STRUCTURE)
  )
  @Get('/outlet/latest/:id')
  getLatestOutlet(@Param('id') id: number) {
    return this.companyStructureService.getLatestOutlet(id);
  }

  @UseGuards(
    PermissionGuard(COMPANY_STRUCTURE_PERMISSION.UPDATE_COMPANY_STRUCTURE)
  )
  @Patch()
  updateLatestOutlet(
    @Body() updateCompanyStructureDto: UpdateCompanyStructureDto
  ) {
    return this.companyStructureService.updateLatestOutlet(
      updateCompanyStructureDto
    );
  }
}
