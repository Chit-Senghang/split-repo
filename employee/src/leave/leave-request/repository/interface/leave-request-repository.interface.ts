import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { Employee } from '../../../../employee/entity/employee.entity';
import { LeaveType } from '../../../leave-request-type/entities/leave-type.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';

export interface ILeaveRequestRepository extends IRepositoryBase<LeaveRequest> {
  getLeaveRequestById(id: number): Promise<LeaveRequest>;
  generateLeaveStockForSpecificType(
    leaveType: LeaveType,
    employee: Employee,
    isForCurrentYear: boolean,
    date?: string
  ): Promise<void>;
  generateLeaveStockForNewType(
    leaveType: LeaveType,
    date?: string
  ): Promise<void>;
}
