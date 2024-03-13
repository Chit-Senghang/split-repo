import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { EmployeeMovement } from '../../entities/employee-movement.entity';

export interface IEmployeeMovementRepository
  extends IRepositoryBase<EmployeeMovement> {
  getEmployeeLastMovement(employeeId: number): Promise<EmployeeMovement>;
  getEmployeeMovementWithNotFound(id: number): Promise<EmployeeMovement>;
}
