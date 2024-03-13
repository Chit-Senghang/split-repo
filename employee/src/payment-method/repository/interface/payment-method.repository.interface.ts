import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { PaymentMethod } from '../../entities/payment-method.entity';

export interface IPaymentMethodRepository
  extends IRepositoryBase<PaymentMethod> {}
