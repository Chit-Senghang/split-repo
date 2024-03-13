import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PAYROLL_POST_PROBATION_PERMISSION } from '../shared-resources/ts/enum/permission/employee/crud-payroll-post-probation.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_MASTER_INFORMATION_PERMISSION } from '../shared-resources/ts/enum/permission';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ATTACH_USER_TO_EMPLOYEE_PERMISSION } from './../shared-resources/ts/enum/permission/employee/employee-master-information.enum';
import { EmployeeMasterInformationPagination } from './dto/employee-pagination.dto';
import {
  UpdateEmployeeDto,
  UpdatePostProbation
} from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entity/employee.entity';
import { EmployeeUniquePagination } from './dto/employee-employee-unique';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('employee-master-information')
@Controller('employee-master-information')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.CREATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: EmployeeMasterInformationPagination,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.employeeService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.UPDATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @Patch('resend-confirmation/:employeeId')
  resendEmailIsAdmin(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeService.resendEmailIsAdmin(employeeId);
  }

  @UseGuards(
    PermissionGuard(ATTACH_USER_TO_EMPLOYEE_PERMISSION.ATTACH_USER_TO_EMPLOYEE)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Patch(':employeeId/user')
  attachUserToEmployee(
    @Body('userId') userId: number,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeService.attachUserToEmployee(employeeId, userId);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.READ_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @Get(':id')
  @ApiOkResponse({ type: Employee })
  findOne(@Param('id') id: number) {
    return this.employeeService.findOne(id);
  }

  @Get('check/unique')
  checkUniqueContactAndEmail(@Query() pagination: EmployeeUniquePagination) {
    return this.employeeService.checkUniqueContactAndEmail(pagination);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.READ_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @Get()
  @ApiOkResponse({ type: getPaginationResponseDto(Employee) })
  findAll(@Query() pagination: EmployeeMasterInformationPagination) {
    return this.employeeService.findAll(pagination);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.READ_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @Get('/search/template')
  @ApiOkResponse({ type: getPaginationResponseDto(Employee) })
  findAllWithTemplate(
    @Query() pagination: EmployeeMasterInformationPagination
  ) {
    return this.employeeService.findAllWithTemplate(pagination);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.DELETE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.employeeService.delete(id);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.UPDATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_POST_PROBATION_PERMISSION.UPDATE_PAYROLL_POST_PROBATION
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Put(':id/probation')
  updatePostProbation(
    @Param('id') id: number,
    @Body() updatePostProbationDto: UpdatePostProbation
  ) {
    return this.employeeService.updatePostProbation(updatePostProbationDto, id);
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_POST_PROBATION_PERMISSION.UPDATE_PAYROLL_POST_PROBATION
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Put('probation')
  updateAllPostProbation() {
    return this.employeeService.updatePostProbation();
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.UPDATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/cancel/:employeeId')
  cancelEmployeeUpdateInformation(@Param('employeeId') employeeId: number) {
    return this.employeeService.cancelEmployeeUpdateInformation(employeeId);
  }
}
