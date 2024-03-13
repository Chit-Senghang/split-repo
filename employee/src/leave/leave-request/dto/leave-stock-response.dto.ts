import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class LeaveStockResponseDto {
  leaveType: object;
}

export class LeaveTypeResponseDto {
  @IsNumber()
  @IsNotEmpty()
  remaining: number;

  @IsNumber()
  @IsNotEmpty()
  used: number;

  @IsNumber()
  @IsOptional()
  allowance?: number;
}
