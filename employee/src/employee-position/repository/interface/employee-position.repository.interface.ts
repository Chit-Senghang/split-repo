import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeePosition } from '../../entities/employee-position.entity';

export interface IEmployeePositionRepository
  extends IRepositoryBase<EmployeePosition> {}
