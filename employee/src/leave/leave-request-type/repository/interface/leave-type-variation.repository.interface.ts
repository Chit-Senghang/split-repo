import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { Employee } from '../../../../employee/entity/employee.entity';
import { LeaveTypeVariation } from '../../entities/leave-type-variation.entity';

export interface ILeaveTypeVariationRepository
  extends IRepositoryBase<LeaveTypeVariation> {
  getLeaveTypeVariationByEmployee(
    employee: Employee
  ): Promise<LeaveTypeVariation[]>;
  getLeaveTypeVariationById(id: number): Promise<LeaveTypeVariation>;
  getLeaveTypeVariationByLeaveTypeId(id: number): Promise<LeaveTypeVariation[]>;
  deleteLeaveTypeVariationByLeaveTypeId(
    id: number,
    leaveTypeVariationIds: number[]
  ): Promise<void>;

  getLeaveTypeVariationByEmployeeAndLeaveTypeId(
    employee: Employee,
    leaveTypeId: number
  ): Promise<LeaveTypeVariation>;

  getEmployeeLeaveTypeVariationById(
    id: number,
    employee: Employee
  ): Promise<LeaveTypeVariation>;
}
