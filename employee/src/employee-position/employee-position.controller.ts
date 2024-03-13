import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseInterceptors,
  Get,
  Query,
  HttpStatus,
  UseGuards,
  Put
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
import { EMPLOYEE_MASTER_INFORMATION_PERMISSION } from '../shared-resources/ts/enum/permission';
import { EmployeePositionService } from './employee-position.service';
import { CreateEmployeePositionDto } from './dto/create-employee-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';
import { EmployeePosition } from './entities/employee-position.entity';
import { PaginationQueryEmployeePositionDto } from './dto/pagination-query-employee-position.dto';
import { DeleteAndInsertEmployeePositionDto } from './dto/delete-and-create-employee-position.dto';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-position')
@Controller()
export class EmployeePositionController {
  constructor(
    private readonly employeePositionService: EmployeePositionService
  ) {}

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-position')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.CREATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeePositionDto: CreateEmployeePositionDto
  ) {
    return this.employeePositionService.create(
      employeeId,
      createEmployeePositionDto,
      true
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeePosition) })
  @Get('/:employeeId/employee-position')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.READ_EMPLOYEE_MASTER_INFORMATION
    )
  )
  findAll(
    @Query() pagination: PaginationQueryEmployeePositionDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeePositionService.findAll(pagination, employeeId);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @Get('employee-by-position/:employeeId')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.READ_EMPLOYEE_MASTER_INFORMATION
    )
  )
  employeeByPosition(@Param('employeeId') employeeId: number) {
    return this.employeePositionService.employeeByPosition(employeeId);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: EmployeePosition })
  @Get('/:employeeId/employee-position/:id')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.READ_EMPLOYEE_MASTER_INFORMATION
    )
  )
  findOne(@Param('employeeId') employeeId: number, @Param('id') id: number) {
    return this.employeePositionService.findOne(employeeId, id);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-position/:id')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.UPDATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  update(
    @Param('employeeId') employeeId: number,
    @Param('id') id: number,
    @Body() updateEmployeePositionDto: UpdateEmployeePositionDto
  ) {
    return this.employeePositionService.update(
      employeeId,
      id,
      updateEmployeePositionDto
    );
  }

  @Put('/:employeeId/employee-position')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.UPDATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  updateEmployeePosition(
    @Param('employeeId') employeeId: number,
    @Body() dto: DeleteAndInsertEmployeePositionDto
  ) {
    return this.employeePositionService.updateEmployeePosition(employeeId, dto);
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @Patch('/:employeeId/employee-position/switch-default-position/:id')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.UPDATE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  switchDefaultPosition(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeePositionService.switchDefaultPosition(id, employeeId);
  }

  @Delete('/:employeeId/employee-position/:id')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_MASTER_INFORMATION_PERMISSION.DELETE_EMPLOYEE_MASTER_INFORMATION
    )
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeePositionService.delete(id, employeeId);
  }
}
