import { Module } from '@nestjs/common';
import { DayOffRequestModule } from './day-off-request/day-off-request.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';
import { LeaveRequestTypeModule } from './leave-request-type/leave-request-type.module';
import { MissionRequestModule } from './mission-request/mission-request.module';

@Module({
  imports: [
    DayOffRequestModule,
    LeaveRequestModule,
    LeaveRequestTypeModule,
    MissionRequestModule
  ]
})
export class LeaveModule {}
