import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  HttpCode
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
import { EMPLOYEE_EDUCATION_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-education.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { EmployeeEducationService } from './employee-education.service';
import { CreateEmployeeEducationDto } from './dto/create-employee-education.dto';
import { UpdateEmployeeEducationDto } from './dto/update-employee-education.dto';
import { PaginationEmployeeEducationDto } from './dto/pagination-employee-education.dto';
import { EmployeeEducation } from './entities/employee-education.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-education')
@Controller()
export class EmployeeEducationController {
  constructor(
    private readonly employeeEducationService: EmployeeEducationService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_EDUCATION_PERMISSION.CREATE_EMPLOYEE_EDUCATION)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-education')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeEducationDto: CreateEmployeeEducationDto
  ) {
    return this.employeeEducationService.create(
      employeeId,
      createEmployeeEducationDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_EDUCATION_PERMISSION.READ_EMPLOYEE_EDUCATION)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeEducation) })
  @Get('/:employeeId/employee-education')
  findAll(
    @Query() pagination: PaginationEmployeeEducationDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeEducationService.findAll(pagination, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_EDUCATION_PERMISSION.READ_EMPLOYEE_EDUCATION)
  )
  @ApiOkResponse({ type: EmployeeEducation })
  @Get('/:employeeId/employee-education/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeEducationService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_EDUCATION_PERMISSION.UPDATE_EMPLOYEE_EDUCATION)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-education/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeEducationDto: UpdateEmployeeEducationDto
  ) {
    return this.employeeEducationService.update(
      id,
      employeeId,
      updateEmployeeEducationDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_EDUCATION_PERMISSION.DELETE_EMPLOYEE_EDUCATION)
  )
  @Delete('/:employeeId/employee-education/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeEducationService.delete(id, employeeId);
  }
}
