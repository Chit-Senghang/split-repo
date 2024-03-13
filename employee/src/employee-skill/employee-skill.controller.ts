import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Query,
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
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_SKILL_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-skill.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { EmployeeSkillService } from './employee-skill.service';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';
import { PaginationEmployeeSkillDto } from './dto/pagination-employee-skill.dto';
import { EmployeeSkill } from './entities/employee-skill.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-skill')
@Controller()
export class EmployeeSkillController {
  constructor(private readonly employeeSkillService: EmployeeSkillService) {}

  @UseGuards(PermissionGuard(EMPLOYEE_SKILL_PERMISSION.CREATE_EMPLOYEE_SKILL))
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-skill')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeSkillDto: CreateEmployeeSkillDto
  ) {
    return this.employeeSkillService.create(employeeId, createEmployeeSkillDto);
  }

  @UseGuards(PermissionGuard(EMPLOYEE_SKILL_PERMISSION.READ_EMPLOYEE_SKILL))
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeSkill) })
  @Get('/:employeeId/employee-skill')
  findAll(
    @Query() pagination: PaginationEmployeeSkillDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeSkillService.findAll(pagination, employeeId);
  }

  @UseGuards(PermissionGuard(EMPLOYEE_SKILL_PERMISSION.READ_EMPLOYEE_SKILL))
  @ApiOkResponse({ type: EmployeeSkill })
  @Get('/:employeeId/employee-skill/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeSkillService.findOne(id, employeeId);
  }

  @UseGuards(PermissionGuard(EMPLOYEE_SKILL_PERMISSION.UPDATE_EMPLOYEE_SKILL))
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-skill/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeSkillDto: UpdateEmployeeSkillDto
  ) {
    return this.employeeSkillService.update(
      id,
      employeeId,
      updateEmployeeSkillDto
    );
  }

  @UseGuards(PermissionGuard(EMPLOYEE_SKILL_PERMISSION.DELETE_EMPLOYEE_SKILL))
  @Delete('/:employeeId/employee-skill/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeSkillService.delete(id, employeeId);
  }
}
