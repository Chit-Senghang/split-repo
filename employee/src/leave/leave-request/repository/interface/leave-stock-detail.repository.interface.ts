import { QueryRunner } from 'typeorm';
import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { LeaveStockDetail } from '../../entities/leave-stock-detail.entity';
import { LeaveStockDetailTypeEnum } from '../../enums/leave-stock-detail.enum';
import { LeaveStock } from '../../entities/leave-stock.entity';

export interface ILeaveStockDetailRepository
  extends IRepositoryBase<LeaveStockDetail> {
  getLeaveStockDetailByLeaveStockIdWithTypeAndDate(
    leaveStockId: number,
    date: string | Date,
    type: LeaveStockDetailTypeEnum
  ): Promise<LeaveStockDetail>;

  getTotalLeaveDayByLeaveStockIdWithType(
    leaveStockId: number,
    year: number,
    month: number,
    type: LeaveStockDetailTypeEnum
  ): Promise<number>;

  getTotalProrateAllowanceFromDateToStartOfYear(
    leaveStock: LeaveStock,
    employeeId: number,
    date: string,
    queryRunner?: QueryRunner
  ): Promise<{
    totalProrateRemaining: number;
    totalProrateAllowance: number;
    carryForward: number;
  }>;

  getTotalLeaveDayByLeaveStockAndWithDate(
    leaveStockId: number,
    date: string
  ): Promise<number>;
}
