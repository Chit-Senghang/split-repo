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
  Query
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION } from './../shared-resources/ts/enum/permission';
import { PayrollBenefitAdjustmentService } from './payroll-benefit-adjustment.service';
import { CreatePayrollBenefitAdjustmentDto } from './dto/create-payroll-benefit-adjustment.dto';
import { UpdatePayrollBenefitAdjustmentDto } from './dto/update-payroll-benefit-adjustment.dto';
import { PaginationPayrollAdjustmentDto } from './dto/paginate-payroll-adjustment.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiTags('payroll-benefit-adjustment')
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@Controller('payroll-benefit-adjustment')
export class PayrollBenefitAdjustmentController {
  constructor(
    private readonly payrollBenefitAdjustmentService: PayrollBenefitAdjustmentService
  ) {}

  @UseGuards(
    PermissionGuard(
      PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION.CREATE_PAYROLL_BENEFIT_ADJUSTMENT
    )
  )
  @Post()
  create(
    @Body() createPayrollBenefitAdjustmentDto: CreatePayrollBenefitAdjustmentDto
  ) {
    return this.payrollBenefitAdjustmentService.create(
      createPayrollBenefitAdjustmentDto
    );
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION.READ_PAYROLL_BENEFIT_ADJUSTMENT
    )
  )
  @Get()
  findAll(@Query() paginate: PaginationPayrollAdjustmentDto) {
    return this.payrollBenefitAdjustmentService.findAll(paginate);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationPayrollAdjustmentDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.payrollBenefitAdjustmentService.exportPayrollAdjustmentFile(
      pagination,
      exportFileDto
    );
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION.READ_PAYROLL_BENEFIT_ADJUSTMENT
    )
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.payrollBenefitAdjustmentService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION.READ_PAYROLL_BENEFIT_ADJUSTMENT
    )
  )
  @Get('adjustment/type')
  getAllAdjustmentType() {
    return this.payrollBenefitAdjustmentService.getAdjustmentType();
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION.UPDATE_PAYROLL_BENEFIT_ADJUSTMENT
    )
  )
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePayrollBenefitAdjustmentDto: UpdatePayrollBenefitAdjustmentDto
  ) {
    return this.payrollBenefitAdjustmentService.update(
      id,
      updatePayrollBenefitAdjustmentDto
    );
  }

  @UseGuards(
    PermissionGuard(
      PAYROLL_BENEFIT_ADJUSTMENT_PERMISSION.DELETE_PAYROLL_BENEFIT_ADJUSTMENT
    )
  )
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.payrollBenefitAdjustmentService.delete(id);
  }
}
