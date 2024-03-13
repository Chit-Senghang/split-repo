import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkShiftTypeController } from './workshift-type.controller';
import { WorkshiftType } from './entities/workshift-type.entity';
import { WorkShiftTypeService } from './workshift-type.service';

@Module({
  controllers: [WorkShiftTypeController],
  providers: [WorkShiftTypeService],
  imports: [TypeOrmModule.forFeature([WorkshiftType])],
  exports: [WorkShiftTypeService]
})
export class WorkshiftTypeModule {}
