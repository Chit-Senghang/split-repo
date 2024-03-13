import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicHolidayService } from './public-holiday.service';
import { PublicHolidayController } from './public-holiday.controller';
import { PublicHoliday } from './entities/public-holiday.entity';
import { PublicHolidayRepository } from './repository/public-holiday.repository';

@Module({
  controllers: [PublicHolidayController],
  providers: [PublicHolidayService, PublicHolidayRepository],
  imports: [TypeOrmModule.forFeature([PublicHoliday])]
})
export class PublicHolidayModule {}
