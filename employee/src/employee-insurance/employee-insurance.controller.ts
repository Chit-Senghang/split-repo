import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseInterceptors,
  UseGuards,
  Query
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
import { EMPLOYEE_INSURANCE_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-insurance.enum';
import { EmployeeInsuranceService } from './employee-insurance.service';
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
import { PaginationEmployeeInsurance } from './dto/pagination-employee-insurance.dto';
import { EmployeeInsurance } from './entities/employee-insurance.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-insurance')
@Controller()
export class EmployeeInsuranceController {
  constructor(
    private readonly employeeInsuranceService: EmployeeInsuranceService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_INSURANCE_PERMISSION.CREATE_EMPLOYEE_INSURANCE)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-insurance')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeInsuranceDto: CreateEmployeeInsuranceDto
  ) {
    return this.employeeInsuranceService.create(
      employeeId,
      createEmployeeInsuranceDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_INSURANCE_PERMISSION.READ_EMPLOYEE_INSURANCE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeInsurance) })
  @Get('/:employeeId/employee-insurance')
  findAll(
    @Query() pagination: PaginationEmployeeInsurance,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeInsuranceService.findAll(pagination, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_INSURANCE_PERMISSION.READ_EMPLOYEE_INSURANCE)
  )
  @ApiOkResponse({ type: EmployeeInsurance })
  @Get('/:employeeId/employee-insurance/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeInsuranceService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_INSURANCE_PERMISSION.UPDATE_EMPLOYEE_INSURANCE)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-insurance/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeInsuranceDto: UpdateEmployeeInsuranceDto
  ) {
    return this.employeeInsuranceService.update(
      id,
      employeeId,
      updateEmployeeInsuranceDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_INSURANCE_PERMISSION.DELETE_EMPLOYEE_INSURANCE)
  )
  @Delete('/:employeeId/employee-insurance/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeInsuranceService.delete(id, employeeId);
  }
}
