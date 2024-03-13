import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  HttpCode,
  UseGuards
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
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { PAYROLL_DEDUCTION_PERMISSION } from '../shared-resources/ts/enum/permission/employee/payroll-deduction.enum';
import { PayrollDeductionService } from './payroll-deduction.service';
import { CreatePayrollDeductionDto } from './dto/create-payroll-deduction.dto';
import { UpdatePayrollDeductionDto } from './dto/update-payroll-deduction.dto';
import { PayrollDeductionPagination } from './dto/payroll-deduction-pagination.dto';
import { PayrollDeduction } from './entities/payroll-deduction.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('payroll-deduction')
@Controller('payroll-deduction')
export class PayrollDeductionController {
  constructor(
    private readonly payrollDeductionService: PayrollDeductionService
  ) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(PAYROLL_DEDUCTION_PERMISSION.CREATE_PAYROLL_DEDUCTION)
  )
  @Post()
  create(@Body() createPayrollDeductionDto: CreatePayrollDeductionDto) {
    return this.payrollDeductionService.create(createPayrollDeductionDto);
  }

  @ApiOkResponse({ type: getPaginationResponseDto(PayrollDeduction) })
  @UseGuards(
    PermissionGuard(PAYROLL_DEDUCTION_PERMISSION.READ_PAYROLL_DEDUCTION)
  )
  @Get()
  findAll(@Query() pagination: PayrollDeductionPagination) {
    return this.payrollDeductionService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PayrollDeductionPagination,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.payrollDeductionService.exportFile(pagination, exportFileDto);
  }

  @ApiCreatedResponse({ type: PayrollDeduction })
  @UseGuards(
    PermissionGuard(PAYROLL_DEDUCTION_PERMISSION.READ_PAYROLL_DEDUCTION)
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.payrollDeductionService.findOne(id);
  }

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(PAYROLL_DEDUCTION_PERMISSION.UPDATE_PAYROLL_DEDUCTION)
  )
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePayrollDeductionDto: UpdatePayrollDeductionDto
  ) {
    return this.payrollDeductionService.update(id, updatePayrollDeductionDto);
  }

  @UseGuards(
    PermissionGuard(PAYROLL_DEDUCTION_PERMISSION.DELETE_PAYROLL_DEDUCTION)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.payrollDeductionService.delete(id);
  }
}
