import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { LeaveTypeVariation } from '../../../leave-request-type/entities/leave-type-variation.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { LeaveStock } from '../../entities/leave-stock.entity';

type DateRange = {
  fromDate: string;
  toDate: string;
};

export interface ILeaveStockRepository extends IRepositoryBase<LeaveStock> {
  getEmployeeLeaveStock(employeeId: number): Promise<LeaveStock>;
  getLeaveStockByLeaveRequest(leaveRequest: LeaveRequest): Promise<LeaveStock>;
  getEmployeeLeaveStockByLeaveTypeId(
    employeeId: number,
    leaveTypeId: number,
    dateTime: string | Date,
    isValidate?: boolean
  ): Promise<LeaveStock>;
  getLeaveStockByLeaveTypeVariation(
    leaveTypeVariation: LeaveTypeVariation,
    employeeId: number,
    dateRange: DateRange
  ): Promise<LeaveStock>;
}
