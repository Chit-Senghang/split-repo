import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionLevelController } from './position-level.controller';
import { PositionLevelService } from './position-level.service';
import { PositionLevel } from './entities/position-level.entity';

@Module({
  controllers: [PositionLevelController],
  providers: [PositionLevelService],
  imports: [TypeOrmModule.forFeature([PositionLevel])],
  exports: [PositionLevelService]
})
export class PositionLevelModule {}
