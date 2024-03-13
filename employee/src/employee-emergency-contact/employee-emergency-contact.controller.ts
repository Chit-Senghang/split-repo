import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  HttpCode,
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
import { EMPLOYEE_EMERGENCY_CONTACT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-emergency-contact.enum';
import { EmployeeEmergencyContactService } from './employee-emergency-contact.service';
import { CreateEmployeeEmergencyContactDto } from './dto/create-employee-emergency-contact.dto';
import { UpdateEmployeeEmergencyContactDto } from './dto/update-employee-emergency-contact.dto';
import { PaginationEmployeeEmergencyContactDto } from './dto/pagination-employee-emergency-contact.dto';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-emergency-contact')
@Controller()
export class EmployeeEmergencyContactController {
  constructor(
    private readonly employeeEmergencyContactService: EmployeeEmergencyContactService
  ) {}

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_EMERGENCY_CONTACT_PERMISSION.CREATE_EMPLOYEE_EMERGENCY_CONTACT
    )
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-emergency-contact')
  create(
    @Param('employeeId') employeeId: number,
    @Body()
    createEmployeeEmergencyContactDto: CreateEmployeeEmergencyContactDto
  ) {
    return this.employeeEmergencyContactService.create(
      employeeId,
      createEmployeeEmergencyContactDto
    );
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_EMERGENCY_CONTACT_PERMISSION.READ_EMPLOYEE_EMERGENCY_CONTACT
    )
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeEmergencyContact) })
  @Get('/:employeeId/employee-emergency-contact')
  findAll(
    @Param('employeeId') employeeId: number,
    @Query() pagination: PaginationEmployeeEmergencyContactDto
  ) {
    return this.employeeEmergencyContactService.findAll(pagination, employeeId);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_EMERGENCY_CONTACT_PERMISSION.READ_EMPLOYEE_EMERGENCY_CONTACT
    )
  )
  @ApiOkResponse({ type: EmployeeEmergencyContact })
  @Get('/:employeeId/employee-emergency-contact/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeEmergencyContactService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_EMERGENCY_CONTACT_PERMISSION.UPDATE_EMPLOYEE_EMERGENCY_CONTACT
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-emergency-contact/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeEmergencyContactDto: UpdateEmployeeEmergencyContactDto
  ) {
    return this.employeeEmergencyContactService.update(
      id,
      employeeId,
      updateEmployeeEmergencyContactDto
    );
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_EMERGENCY_CONTACT_PERMISSION.DELETE_EMPLOYEE_EMERGENCY_CONTACT
    )
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeEmergencyContactService.delete(id, employeeId);
  }
}
