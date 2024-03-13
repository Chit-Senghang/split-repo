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
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_TRAINING_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-training.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { EmployeeTrainingService } from './employee-training.service';
import { CreateEmployeeTrainingDto } from './dto/create-employee-training.dto';
import { UpdateEmployeeTrainingDto } from './dto/update-employee-training.dto';
import { PaginationEmployeeTrainingDto } from './dto/pagination-employee-training.dto';
import { EmployeeTraining } from './entities/employee-training.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-training')
@Controller()
export class EmployeeTrainingController {
  constructor(
    private readonly employeeTrainingService: EmployeeTrainingService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_TRAINING_PERMISSION.CREATE_EMPLOYEE_TRAINING)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-training')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeTrainingDto: CreateEmployeeTrainingDto
  ) {
    return this.employeeTrainingService.create(
      employeeId,
      createEmployeeTrainingDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_TRAINING_PERMISSION.READ_EMPLOYEE_TRAINING)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeTraining) })
  @Get('/:employeeId/employee-training')
  findAll(
    @Query() pagination: PaginationEmployeeTrainingDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeTrainingService.findAll(pagination, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_TRAINING_PERMISSION.READ_EMPLOYEE_TRAINING)
  )
  @ApiOkResponse({ type: EmployeeTraining })
  @Get('/:employeeId/employee-training/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeTrainingService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_TRAINING_PERMISSION.UPDATE_EMPLOYEE_TRAINING)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-training/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeTrainingDto: UpdateEmployeeTrainingDto
  ) {
    return this.employeeTrainingService.update(
      id,
      employeeId,
      updateEmployeeTrainingDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_TRAINING_PERMISSION.DELETE_EMPLOYEE_TRAINING)
  )
  @Delete('/:employeeId/employee-training/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeTrainingService.delete(id, employeeId);
  }
}
