import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UseInterceptors,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION } from '../shared-resources/ts/enum/permission/employee/employee-bank-account.enum';
import { EmployeePaymentMethodAccount } from './entities/employee-payment-method-account.entity';
import { EmployeePaymentMethodAccountService } from './employee-payment-method-account.service';
import { CreateEmployeePaymentMethodAccountDto } from './dto/create-employee-payment-method-account.dto';
import { PaginationEmployeePaymentMethodAccountDto } from './dto/pagination-employee-payment-method-account.dto';
import { UpdateEmployeePaymentMethodAccountDto } from './dto/update-employee-payment-method-account.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('employee-payment-method-account')
@Controller()
export class EmployeePaymentMethodAccountController {
  constructor(
    private readonly employeePaymentMethodAccountService: EmployeePaymentMethodAccountService
  ) {}

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION.CREATE_EMPLOYEE_PAYMENT_METHOD_ACCOUNT
    )
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post('/:employeeId/employee-payment-method-account')
  create(
    @Param('employeeId') employeeId: number,
    @Body() createEmployeeBackAccountDto: CreateEmployeePaymentMethodAccountDto
  ) {
    return this.employeePaymentMethodAccountService.create(
      employeeId,
      createEmployeeBackAccountDto
    );
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION.READ_EMPLOYEE_PAYMENT_METHOD_ACCOUNT
    )
  )
  @ApiOkResponse({
    type: getPaginationResponseDto(EmployeePaymentMethodAccount)
  })
  @Get('/:employeeId/employee-payment-method-account')
  findAll(
    @Query() pagination: PaginationEmployeePaymentMethodAccountDto,
    @Param('employeeId') employeeId: number
  ) {
    return this.employeePaymentMethodAccountService.findAll(
      pagination,
      employeeId
    );
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION.READ_EMPLOYEE_PAYMENT_METHOD_ACCOUNT
    )
  )
  @ApiOkResponse({ type: EmployeePaymentMethodAccount })
  @Get('/:employeeId/employee-payment-method-account/:id')
  findOne(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeePaymentMethodAccountService.findOne(id, employeeId);
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION.UPDATE_EMPLOYEE_PAYMENT_METHOD_ACCOUNT
    )
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch('/:employeeId/employee-payment-method-account/:id')
  update(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
    @Body() updateEmployeeBackAccountDto: UpdateEmployeePaymentMethodAccountDto
  ) {
    return this.employeePaymentMethodAccountService.update(
      id,
      employeeId,
      updateEmployeeBackAccountDto
    );
  }

  @UseGuards(
    PermissionGuard(
      EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION.DELETE_EMPLOYEE_PAYMENT_METHOD_ACCOUNT
    )
  )
  @Delete('/:employeeId/employee-payment-method-account/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number, @Param('employeeId') employeeId: number) {
    return this.employeePaymentMethodAccountService.delete(id, employeeId);
  }
}
