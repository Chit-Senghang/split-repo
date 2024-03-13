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
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { EMPLOYEE_RESIGNATION_PERMISSION } from '../shared-resources/ts/enum/permission';
import { PermissionGuard } from '../guards/permission.guard';
import { CreateEmployeeResignationDto } from './dto/create-employee-resignation.dto';
import { ResignationPaginationDto } from './dto/resignation-pagination.dto';
import { UpdateEmployeeResignationDto } from './dto/update-employee-resignation.dto';
import { EmployeeResignationService } from './employee-resignation.service';
import { EmployeeResignation } from './entity/employee-resignation.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-resignation')
@UseInterceptors(ResponseMappingInterceptor)
@Controller('employee-resignation')
export class EmployeeResignationController {
  constructor(
    private readonly employeeResignationService: EmployeeResignationService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_RESIGNATION_PERMISSION.CREATE_EMPLOYEE_RESIGNATION)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('employee/:employeeId')
  createEmployeeResignation(
    @Body() createEmployeeResignationDto: CreateEmployeeResignationDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeResignationService.create(
      createEmployeeResignationDto,
      employeeId
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_RESIGNATION_PERMISSION.READ_EMPLOYEE_RESIGNATION)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeResignation) })
  @Get()
  getEmployeeResignation(@Query() pagination: ResignationPaginationDto) {
    return this.employeeResignationService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: ResignationPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.employeeResignationService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_RESIGNATION_PERMISSION.READ_EMPLOYEE_RESIGNATION)
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.employeeResignationService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_RESIGNATION_PERMISSION.UPDATE_EMPLOYEE_RESIGNATION)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  updateEmployeeResignation(
    @Param('id') id: number,
    @Body() updateEmployeeResignation: UpdateEmployeeResignationDto
  ) {
    return this.employeeResignationService.update(
      id,
      updateEmployeeResignation
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_RESIGNATION_PERMISSION.DELETE_EMPLOYEE_RESIGNATION)
  )
  @Delete(':id')
  @HttpCode(204)
  deleteEmployeeResignation(@Param('id') id: number) {
    return this.employeeResignationService.delete(id);
  }
}
