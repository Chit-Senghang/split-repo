import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
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
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PermissionGuard } from '../guards/permission.guard';
import { PAYROLL_DEDUCTION_TYPE_PERMISSION } from '../shared-resources/ts/enum/permission/employee/payroll-deduction-type.enum';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PayrollDeductionTypeService } from './payroll-deduction-type.service';
import { CreatePayrollDeductionTypeDto } from './dto/create-payroll-deduction-type.dto';
import { UpdatePayrollDeductionTypeDto } from './dto/update-payroll-deduction-type.dto';
import { PayrollDeductionTypePagination } from './dto/payroll-deduction-type-pagination.dto';
import { PayrollDeductionType } from './entities/payroll-deduction-type.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('payroll-deduction-type')
@Controller('payroll-deduction-type')
export class PayrollDeductionTypeController {
  constructor(
    private readonly payrollDeductionTypeService: PayrollDeductionTypeService
  ) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(
      PAYROLL_DEDUCTION_TYPE_PERMISSION.CREATE_PAYROLL_DEDUCTION_TYPE
    )
  )
  @Post()
  create(@Body() createPayrollDeductionTypeDto: CreatePayrollDeductionTypeDto) {
    return this.payrollDeductionTypeService.create(
      createPayrollDeductionTypeDto
    );
  }

  @ApiOkResponse({ type: getPaginationResponseDto(PayrollDeductionType) })
  @UseGuards(
    PermissionGuard(
      PAYROLL_DEDUCTION_TYPE_PERMISSION.READ_PAYROLL_DEDUCTION_TYPE
    )
  )
  @Get()
  findAll(@Query() pagination: PayrollDeductionTypePagination) {
    return this.payrollDeductionTypeService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PayrollDeductionTypePagination,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.payrollDeductionTypeService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @ApiOkResponse({ type: PayrollDeductionType })
  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(
      PAYROLL_DEDUCTION_TYPE_PERMISSION.READ_PAYROLL_DEDUCTION_TYPE
    )
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.payrollDeductionTypeService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_DEDUCTION_TYPE_PERMISSION.UPDATE_PAYROLL_DEDUCTION_TYPE
    )
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePayrollDeductionTypeDto: UpdatePayrollDeductionTypeDto
  ) {
    return this.payrollDeductionTypeService.update(
      id,
      updatePayrollDeductionTypeDto
    );
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_DEDUCTION_TYPE_PERMISSION.DELETE_PAYROLL_DEDUCTION_TYPE
    )
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.payrollDeductionTypeService.delete(id);
  }
}
