import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { PaymentMethod } from '../entities/payment-method.entity';
import { IPaymentMethodRepository } from './interface/payment-method.repository.interface';

@Injectable()
export class PaymentMethodRepository
  extends RepositoryBase<PaymentMethod>
  implements IPaymentMethodRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(PaymentMethod));
  }
}
