import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { EMPLOYEE_MOVEMENT_PERMISSION } from '../shared-resources/ts/enum/permission';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { CreateEmployeeMovementDto } from './dto/create-employee-movement.dto';
import { UpdateEmployeeMovementDto } from './dto/update-employee-movement.dto';
import { EmployeeMovementService } from './employee-movement.service';
import { PaginationQueryEmployeeMovementDto } from './dto/pagination-query-employee-movement.dto';
import { EmployeeMovement } from './entities/employee-movement.entity';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-movement')
@Controller('employee-movement')
@UseInterceptors(ResponseMappingInterceptor)
export class EmployeeMovementController {
  constructor(
    private readonly employeeMovementService: EmployeeMovementService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.CREATE_EMPLOYEE_MOVEMENT)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/position/:employeePositionId')
  createEmployeeMovement(
    @Param('employeePositionId', ParseIntPipe) employeePositionId: number,
    @Body() createEmployeeMovementDto: CreateEmployeeMovementDto
  ) {
    return this.employeeMovementService.create(
      employeePositionId,
      createEmployeeMovementDto
    );
  }

  //* Get with (current user login)
  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.READ_EMPLOYEE_MOVEMENT)
  )
  @Get('previous-employee-position')
  getPreviousEmployee() {
    return this.employeeMovementService.getPreviousEmployeeByUserLogin();
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.READ_EMPLOYEE_MOVEMENT)
  )
  @Get('/:userId/current-employee-by-user-login')
  getCurrentEmployeeLogin(@Param('userId') useId: number) {
    return this.employeeMovementService.getCurrentEmployeeLogin(useId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.UPDATE_EMPLOYEE_MOVEMENT)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  updateEmployeeMovement(
    @Param('id') id: number,
    @Body() updateEmployeeMovementDto: UpdateEmployeeMovementDto
  ) {
    return this.employeeMovementService.update(id, updateEmployeeMovementDto);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.READ_EMPLOYEE_MOVEMENT)
  )
  @ApiOkResponse({ type: EmployeeMovement })
  @Get(':id')
  getEmployeeMovement(@Param('id', ParseIntPipe) id: number) {
    return this.employeeMovementService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.READ_EMPLOYEE_MOVEMENT)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeMovement) })
  @Get()
  getAllEmployeeMovement(
    @Query() pagination: PaginationQueryEmployeeMovementDto
  ) {
    return this.employeeMovementService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationQueryEmployeeMovementDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.employeeMovementService.exportFile(pagination, exportFileDto);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_MOVEMENT_PERMISSION.DELETE_EMPLOYEE_MOVEMENT)
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEmployeeMovement(@Param('id') id: number) {
    return this.employeeMovementService.delete(id);
  }
}
