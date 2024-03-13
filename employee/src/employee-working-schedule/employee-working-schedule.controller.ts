import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  UseInterceptors,
  UseGuards,
  Query
  // UseInterceptors
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { EMPLOYEE_WORKING_SCHEDULE_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-working-schedule.enum';
import { PermissionGuard } from '../guards/permission.guard';
import { JobSchedulerLogTypeEnum } from './../enum/job-scheduler-log.enum';
import { EmployeeWorkingScheduleService } from './employee-working-schedule.service';
import { UpdateEmployeeWorkingScheduleDto } from './dto/update-employee-schedule.dto';
import { EmployeeWorkingSchedulePaginationDto } from './dto/paginate.dto';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-working-schedule')
@Controller('employee-working-schedule')
export class EmployeeWorkingScheduleController {
  constructor(
    private readonly employeeWorkingScheduleService: EmployeeWorkingScheduleService
  ) {}

  @Put()
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_WORKING_SCHEDULE_PERMISSION.UPDATE_EMPLOYEE_WORKING_SCHEDULE
    )
  )
  async update(@Body() updateData: UpdateEmployeeWorkingScheduleDto) {
    return this.employeeWorkingScheduleService.update(updateData);
  }

  @Post()
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_WORKING_SCHEDULE_PERMISSION.CREATE_EMPLOYEE_WORKING_SCHEDULE
    )
  )
  async generateRecord() {
    return this.employeeWorkingScheduleService.generateEmployeeWorkingScheduleRecord();
  }

  @Post('generate/:date')
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_WORKING_SCHEDULE_PERMISSION.CREATE_EMPLOYEE_WORKING_SCHEDULE
    )
  )
  async generateWorkScheduleSpecificDate(@Param('date') date: string) {
    return this.employeeWorkingScheduleService.generateEmployeeWorkingScheduleRecord(
      JobSchedulerLogTypeEnum.USER_INPUT,
      date
    );
  }

  @UseInterceptors(ResponseMappingInterceptor)
  @UseGuards(
    PermissionGuard(
      EMPLOYEE_WORKING_SCHEDULE_PERMISSION.READ_EMPLOYEE_WORKING_SCHEDULE
    )
  )
  @Get(':id')
  async getByEmployeeId(
    @Param('id') id: number,
    @Query() paginate: EmployeeWorkingSchedulePaginationDto
  ) {
    return this.employeeWorkingScheduleService.findOne(id, paginate);
  }
}
