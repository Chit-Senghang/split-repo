import { LeaveStockResponseDto } from './leave-stock-response.dto';

export class LeaveStockDetailDto {
  proratePerMonth: LeaveStockResponseDto;

  specialLeave: LeaveStockResponseDto;

  allowanceTopUp: LeaveStockResponseDto;

  carryForward: LeaveStockResponseDto;

  total: LeaveStockResponseDto;
}
