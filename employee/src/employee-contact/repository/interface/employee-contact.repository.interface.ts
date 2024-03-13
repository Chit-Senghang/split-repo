import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeContact } from '../../entities/employee-contact.entity';

export interface IEmployeeContactRepository
  extends IRepositoryBase<EmployeeContact> {}
