import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeIdentifier } from '../../entities/employee-identifier.entity';

export interface IEmployeeIdentifierRepository
  extends IRepositoryBase<EmployeeIdentifier> {}
