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
import { EMPLOYEE_CONTACT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-contact.enum';
import { EmployeeContactService } from './employee-contact.service';
import { CreateEmployeeContactDto } from './dto/create-employee-contact.dto';
import { UpdateEmployeeContactDto } from './dto/update-employee-contact.dto';
import { EmployeeContactPagination } from './dto/pagination-employee-contact.dto';
import { EmployeeContact } from './entities/employee-contact.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-contact')
@Controller()
export class EmployeeContactController {
  constructor(
    private readonly employeeContactService: EmployeeContactService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_CONTACT_PERMISSION.CREATE_EMPLOYEE_CONTACT)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-contact')
  create(
    @Param('employeeId') employeeId: number,
    @Body()
    createEmployeeContactDto: CreateEmployeeContactDto
  ) {
    return this.employeeContactService.create(
      employeeId,
      createEmployeeContactDto
    );
  }

  @UseGuards(PermissionGuard(EMPLOYEE_CONTACT_PERMISSION.READ_EMPLOYEE_CONTACT))
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeContact) })
  @Get('/:employeeId/employee-contact')
  findAll(
    @Param('employeeId') employeeId: number,
    @Query() pagination: EmployeeContactPagination
  ) {
    return this.employeeContactService.findAll(pagination, employeeId);
  }

  @UseGuards(PermissionGuard(EMPLOYEE_CONTACT_PERMISSION.READ_EMPLOYEE_CONTACT))
  @ApiOkResponse({ type: EmployeeContact })
  @Get('/:employeeId/employee-contact/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeContactService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_CONTACT_PERMISSION.UPDATE_EMPLOYEE_CONTACT)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-contact/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeContactDto: UpdateEmployeeContactDto
  ) {
    return this.employeeContactService.update(
      id,
      employeeId,
      updateEmployeeContactDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_CONTACT_PERMISSION.DELETE_EMPLOYEE_CONTACT)
  )
  @Delete('/:employeeId/employee-contact/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeContactService.delete(id, employeeId);
  }
}
