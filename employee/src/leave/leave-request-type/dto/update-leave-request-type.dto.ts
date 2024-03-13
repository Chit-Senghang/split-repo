import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { LeaveTypeDto } from './create-leave-type.dto';

export class UpdateLeaveRequestTypeDto extends PartialType(LeaveTypeDto) {
  @IsNotEmpty()
  @IsNumber()
  priority: number;
}
