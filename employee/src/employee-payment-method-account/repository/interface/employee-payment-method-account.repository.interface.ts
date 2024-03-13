import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeePaymentMethodAccount } from '../../entities/employee-payment-method-account.entity';

export interface IEmployeePaymentMethodAccountRepository
  extends IRepositoryBase<EmployeePaymentMethodAccount> {}
