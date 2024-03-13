import { Module } from '@nestjs/common';
import { BorrowOrPaybackModule } from './borrow-or-payback/borrow-or-payback.module';
import { MissedScanRequestModule } from './missed-scan-request/missed-scan-request.module';
import { OvertimeRequestModule } from './overtime-request/overtime-request.module';
import { PublicHolidayModule } from './public-holiday/public-holiday.module';
import { AttendanceRecordModule } from './attendance-record/attendance-record.module';
import { OvertimeRequestTypeModule } from './overtime-request-type/overtime-request-type.module';

@Module({
  imports: [
    AttendanceRecordModule,
    BorrowOrPaybackModule,
    MissedScanRequestModule,
    OvertimeRequestModule,
    OvertimeRequestTypeModule,
    PublicHolidayModule
  ]
})
export class AttendanceModule {}
