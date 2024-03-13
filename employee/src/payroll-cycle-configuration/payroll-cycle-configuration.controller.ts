import {
  Controller,
  Get,
  Body,
  UseInterceptors,
  UseGuards,
  Put
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PayrollCycleConfigurationPermissionEnum } from '../shared-resources/ts/enum/permission/employee/payroll-cycle-configuration.enum';
import { PermissionGuard } from '../guards/permission.guard';
import { PayrollCycleConfigurationService } from './payroll-cycle-configuration.service';
import { UpdatePayrollCycleConfigurationDto } from './dto/update-payroll-cycle-configuration.dto';
import { PayrollCycleConfiguration } from './entities/payroll-cycle-configuration.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiTags('payroll-cycle-configuration')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@Controller('payroll-cycle-configuration')
export class PayrollCycleConfigurationController {
  constructor(
    private readonly payrollCycleConfigurationService: PayrollCycleConfigurationService
  ) {}

  @Get()
  @ApiOkResponse({ type: PayrollCycleConfiguration })
  @UseGuards(
    PermissionGuard(
      PayrollCycleConfigurationPermissionEnum.READ_PAYROLL_CYCLE_CONFIGURATION
    )
  )
  findOne() {
    return this.payrollCycleConfigurationService.findOne();
  }

  @Put()
  @UseGuards(
    PermissionGuard(
      PayrollCycleConfigurationPermissionEnum.READ_PAYROLL_CYCLE_CONFIGURATION
    )
  )
  @ApiOkResponse({ type: PayrollCycleConfiguration })
  update(
    @Body()
    updatePayrollCycleConfigurationDto: UpdatePayrollCycleConfigurationDto
  ) {
    return this.payrollCycleConfigurationService.update(
      updatePayrollCycleConfigurationDto
    );
  }
}
