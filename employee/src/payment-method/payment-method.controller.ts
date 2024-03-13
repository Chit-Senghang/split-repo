import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Query,
  UseInterceptors,
  HttpStatus
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { IdResponseDto as IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { PAYMENT_METHOD_PERMISSION } from '../shared-resources/ts/enum/permission';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodPaginationDto } from './dto/pagination-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('payment-method')
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(PermissionGuard(PAYMENT_METHOD_PERMISSION.CREATE_PAYMENT_METHOD))
  @Post()
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @ApiOkResponse({ type: getPaginationResponseDto(PaymentMethod) })
  @UseGuards(PermissionGuard(PAYMENT_METHOD_PERMISSION.READ_PAYMENT_METHOD))
  @Get()
  findAll(@Query() paymentMethodPaginationDto: PaymentMethodPaginationDto) {
    return this.paymentMethodService.findAll(paymentMethodPaginationDto);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaymentMethodPaginationDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.paymentMethodService.exportFile(pagination, exportFileDto);
  }

  @ApiOkResponse({ type: PaymentMethod })
  @UseGuards(PermissionGuard(PAYMENT_METHOD_PERMISSION.READ_PAYMENT_METHOD))
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.paymentMethodService.findOne(id);
  }

  @ApiOkResponse({ type: PaymentMethod })
  @UseGuards(PermissionGuard(PAYMENT_METHOD_PERMISSION.READ_PAYMENT_METHOD))
  @Get('ibanking-report-format/list')
  bankingReportFormat() {
    return this.paymentMethodService.bankReportFormatEnum();
  }

  @ApiOkResponse({ type: IdResponseDto })
  @UseGuards(PermissionGuard(PAYMENT_METHOD_PERMISSION.UPDATE_PAYMENT_METHOD))
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto
  ) {
    return this.paymentMethodService.update(id, updatePaymentMethodDto);
  }

  @UseGuards(PermissionGuard(PAYMENT_METHOD_PERMISSION.DELETE_PAYMENT_METHOD))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number) {
    return this.paymentMethodService.delete(id);
  }
}
