import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OvertimeRequestTypeService } from './overtime-request-type.service';
import { OvertimeRequestTypeController } from './overtime-request-type.controller';
import { OvertimeRequestType } from './entities/overtime-request-type.entity';

@Module({
  controllers: [OvertimeRequestTypeController],
  providers: [OvertimeRequestTypeService],
  imports: [TypeOrmModule.forFeature([OvertimeRequestType])]
})
export class OvertimeRequestTypeModule {}
