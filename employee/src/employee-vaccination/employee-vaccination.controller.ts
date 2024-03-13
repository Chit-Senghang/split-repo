import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
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
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_VACCINATION_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-vaccination.enum';
import { EmployeeVaccinationService } from './employee-vaccination.service';
import { CreateEmployeeVaccinationDto } from './dto/create-employee-vaccination.dto';
import { UpdateEmployeeVaccinationDto } from './dto/update-employee-vaccination.dto';
import { PaginationEmployeeVaccinationDto } from './dto/pagination-employee-vaccination.dto';
import { EmployeeVaccination } from './entities/employee-vaccination.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-vaccination')
@Controller(':employeeId/employee-vaccination')
export class EmployeeVaccinationController {
  constructor(
    private readonly employeeVaccinationService: EmployeeVaccinationService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_VACCINATION_PERMISSION.CREATE_EMPLOYEE_VACCINATION)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeVaccinationDto: CreateEmployeeVaccinationDto
  ) {
    return this.employeeVaccinationService.create(
      employeeId,
      createEmployeeVaccinationDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_VACCINATION_PERMISSION.READ_EMPLOYEE_VACCINATION)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeVaccination) })
  @Get()
  findAll(
    @Param('employeeId') employeeId: number,
    @Query() pagination: PaginationEmployeeVaccinationDto
  ) {
    return this.employeeVaccinationService.findAll(employeeId, pagination);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_VACCINATION_PERMISSION.READ_EMPLOYEE_VACCINATION)
  )
  @ApiOkResponse({ type: EmployeeVaccination })
  @Get(':id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeVaccinationService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_VACCINATION_PERMISSION.UPDATE_EMPLOYEE_VACCINATION)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeVaccinationDto: UpdateEmployeeVaccinationDto
  ) {
    return this.employeeVaccinationService.update(
      id,
      employeeId,
      updateEmployeeVaccinationDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_VACCINATION_PERMISSION.DELETE_EMPLOYEE_VACCINATION)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeVaccinationService.delete(id, employeeId);
  }
}
