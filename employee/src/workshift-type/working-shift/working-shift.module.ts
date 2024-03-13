import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingShift } from '../entities/working-shift.entity';
import { WorkshiftType } from '../entities/workshift-type.entity';
import { WorkingShiftRepository } from '../repository/working-shift.repository';
import { WorkingShiftService } from './working-shift.service';
import { WorkingShiftController } from './working-shift.controller';

@Module({
  controllers: [WorkingShiftController],
  providers: [WorkingShiftService, WorkingShiftRepository],
  imports: [TypeOrmModule.forFeature([WorkingShift, WorkshiftType])],
  exports: [WorkingShiftService, WorkingShiftRepository]
})
export class WorkingShiftModule {}
