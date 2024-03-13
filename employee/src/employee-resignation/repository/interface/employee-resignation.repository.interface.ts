import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeResignation } from '../../entity/employee-resignation.entity';
import { FindResignDateAndStatus } from './employee-resignation.type';

export interface IEmployeeResignationRepository
  extends IRepositoryBase<EmployeeResignation> {
  findResignDateDateAndStatus(
    option: FindResignDateAndStatus
  ): Promise<EmployeeResignation[]>;

  getEmployeeResignationByEmployeeId(
    employeeId: number
  ): Promise<EmployeeResignation>;
}
