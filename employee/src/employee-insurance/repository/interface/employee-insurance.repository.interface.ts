import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeInsurance } from '../../entities/employee-insurance.entity';

export interface IEmployeeInsuranceRepository
  extends IRepositoryBase<EmployeeInsurance> {}
