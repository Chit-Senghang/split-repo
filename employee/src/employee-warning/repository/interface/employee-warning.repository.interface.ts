import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeWarning } from '../../entities/employee-warning.entity';

export interface IEmployeeWarning extends IRepositoryBase<EmployeeWarning> {
  countWarning(
    warningDate: string,
    warningTypeId: number,
    employeeId: number
  ): Promise<number>;

  getEmployeeWarningById(id: number): Promise<EmployeeWarning>;
}
