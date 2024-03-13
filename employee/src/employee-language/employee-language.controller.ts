import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
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
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_LANGUAGE_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-language.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { EmployeeLanguageService } from './employee-language.service';
import { CreateEmployeeLanguageDto } from './dto/create-employee-language.dto';
import { UpdateEmployeeLanguageDto } from './dto/update-employee-language.dto';
import { PaginationEmployeeLanguageDto } from './dto/pagination-employee-language.dto';
import { EmployeeLanguage } from './entities/employee-language.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-language')
@Controller()
export class EmployeeLanguageController {
  constructor(
    private readonly employeeLanguageService: EmployeeLanguageService
  ) {}

  @UseGuards(
    PermissionGuard(EMPLOYEE_LANGUAGE_PERMISSION.CREATE_EMPLOYEE_LANGUAGE)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-language')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeLanguageDto: CreateEmployeeLanguageDto
  ) {
    return this.employeeLanguageService.create(
      employeeId,
      createEmployeeLanguageDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_LANGUAGE_PERMISSION.READ_EMPLOYEE_LANGUAGE)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(EmployeeLanguage) })
  @Get('/:employeeId/employee-language')
  findAll(
    @Query() pagination: PaginationEmployeeLanguageDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeeLanguageService.findAll(pagination, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_LANGUAGE_PERMISSION.READ_EMPLOYEE_LANGUAGE)
  )
  @ApiOkResponse({ type: EmployeeLanguage })
  @Get('/:employeeId/employee-language/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeLanguageService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_LANGUAGE_PERMISSION.UPDATE_EMPLOYEE_LANGUAGE)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-language/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeLanguageDto: UpdateEmployeeLanguageDto
  ) {
    return this.employeeLanguageService.update(
      id,
      employeeId,
      updateEmployeeLanguageDto
    );
  }

  @UseGuards(
    PermissionGuard(EMPLOYEE_LANGUAGE_PERMISSION.DELETE_EMPLOYEE_LANGUAGE)
  )
  @Delete('/:employeeId/employee-language/:id')
  @HttpCode(204)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeeLanguageService.delete(id, employeeId);
  }
}
