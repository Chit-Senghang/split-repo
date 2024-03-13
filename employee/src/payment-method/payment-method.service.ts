import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { Repository } from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { paymentMethodConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodPaginationDto } from './dto/pagination-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { iBankingReportFormatEnum } from './enum/ibanking-report-format.enum';

@Injectable()
export class PaymentMethodService {
  private readonly PAYMENT_METHOD = 'payment method';

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>
  ) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto
  ): Promise<PaymentMethod> {
    try {
      const paymentMethod = this.paymentMethodRepo.create({
        ...createPaymentMethodDto
      });
      return await this.paymentMethodRepo.save(paymentMethod);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        paymentMethodConstraint,
        createPaymentMethodDto
      );
    }
  }

  async findAll(pagination: PaymentMethodPaginationDto) {
    return await GetPagination(this.paymentMethodRepo, pagination, ['name'], {
      where: {
        isSystemDefined: pagination?.isSystemDefined
      }
    });
  }

  async exportFile(
    pagination: PaymentMethodPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PAYMENT_METHOD,
      exportFileDto,
      data
    );
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepo.findOne({
      where: { id }
    });
    if (!paymentMethod) {
      throw new ResourceNotFoundException(this.PAYMENT_METHOD, `${id}`);
    }
    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    try {
      const trimPaymentMethodName = updatePaymentMethodDto.name.trim();
      const paymentMethod = await this.findOne(id);
      if (paymentMethod.isSystemDefined === true) {
        throw new ResourceForbiddenException(
          'You are not allowed to make any changes due to system defined'
        );
      }
      return await this.paymentMethodRepo.save(
        Object.assign(paymentMethod, {
          name: trimPaymentMethodName
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        paymentMethodConstraint,
        updatePaymentMethodDto
      );
    }
  }

  async bankReportFormatEnum() {
    return Object.values(iBankingReportFormatEnum);
  }

  async delete(id: number): Promise<void> {
    const paymentMethod = await this.findOne(id);
    if (paymentMethod.isSystemDefined === true) {
      throw new ResourceForbiddenException(
        'You are not allowed to make any changes due to system defined'
      );
    }
    await this.paymentMethodRepo.delete(id);
  }
}
