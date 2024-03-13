import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { EMPLOYEE_WARNING_PERMISSION } from '../shared-resources/ts/enum/permission';
import { PermissionGuard } from '../guards/permission.guard';
import { CreateEmployeeWarningDto } from './dto/create-employee-warning.dto';
import { EmployeeWarningPaginationDto } from './dto/employee-warning-pagination.dto';
import { UpdateEmployeeWarningDto } from './dto/update-employee-warning.dto';
import { EmployeeWarningService } from './employee-warning.service';
import { EmployeeWarning } from './entities/employee-warning.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-warning')
@Controller('employee-warning')
export class EmployeeWarningController {
  constructor(
    private readonly employeeWarningService: EmployeeWarningService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_WARNING_PERMISSION.CREATE_EMPLOYEE_WARNING)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  createEmployeeWarning(
    @Body()
    createEmployeeWarningDto: CreateEmployeeWarningDto
  ) {
    return this.employeeWarningService.createEmployeeWarning(
      createEmployeeWarningDto
    );
  }

  @ApiOkResponse({ type: EmployeeWarning })
  @UseGuards(PermissionGuard(EMPLOYEE_WARNING_PERMISSION.READ_EMPLOYEE_WARNING))
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.employeeWarningService.findOne(id);
  }

  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeWarning) })
  @UseGuards(PermissionGuard(EMPLOYEE_WARNING_PERMISSION.READ_EMPLOYEE_WARNING))
  @Get()
  findAll(@Query() pagination: EmployeeWarningPaginationDto) {
    return this.employeeWarningService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: EmployeeWarningPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.employeeWarningService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_WARNING_PERMISSION.UPDATE_EMPLOYEE_WARNING)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateEmployeeWarningDto: UpdateEmployeeWarningDto
  ) {
    return this.employeeWarningService.update(id, updateEmployeeWarningDto);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_WARNING_PERMISSION.DELETE_EMPLOYEE_WARNING)
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number) {
    return this.employeeWarningService.delete(id);
  }
}
