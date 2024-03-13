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
  HttpCode,
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
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_IDENTIFIER_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-identifier.enum';
import { CreateEmployeeIdentifierDto } from './dto/create-employee-identifier.dto';
import { PaginationEmployeeIdentifierDto } from './dto/pagination-employee-identifier.dto';
import { UpdateEmployeeIdentifierDto } from './dto/update-employee-identifier.dto';
import { EmployeeIdentifierService } from './employee-identifier.service';
import { EmployeeIdentifier } from './entities/employee-identifier.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-identifier')
@Controller()
export class EmployeeIdentifierController {
  constructor(
    private readonly employeeIdentifierService: EmployeeIdentifierService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_IDENTIFIER_PERMISSION.CREATE_EMPLOYEE_IDENTIFIER)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-identifier')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeIdentifierDto: CreateEmployeeIdentifierDto
  ) {
    return this.employeeIdentifierService.create(
      employeeId,
      createEmployeeIdentifierDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_IDENTIFIER_PERMISSION.READ_EMPLOYEE_IDENTIFIER)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeIdentifier) })
  @Get('/:employeeId/employee-identifier')
  findAll(
    @Query() pagination: PaginationEmployeeIdentifierDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeIdentifierService.findAll(pagination, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_IDENTIFIER_PERMISSION.READ_EMPLOYEE_IDENTIFIER)
  )
  @ApiOkResponse({ type: EmployeeIdentifier })
  @Get('/:employeeId/employee-identifier/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeIdentifierService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_IDENTIFIER_PERMISSION.UPDATE_EMPLOYEE_IDENTIFIER)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-identifier/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeIdentifierDto: UpdateEmployeeIdentifierDto
  ) {
    return this.employeeIdentifierService.update(
      id,
      employeeId,
      updateEmployeeIdentifierDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_IDENTIFIER_PERMISSION.DELETE_EMPLOYEE_IDENTIFIER)
  )
  @Delete('/:employeeId/employee-identifier/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeIdentifierService.delete(id, employeeId);
  }
}
