import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinationService } from './vaccination.service';
import { VaccinationController } from './vaccination.controller';
import { Vaccination } from './entities/vaccination.entity';

@Module({
  controllers: [VaccinationController],
  providers: [VaccinationService],
  imports: [TypeOrmModule.forFeature([Vaccination])],
  exports: [VaccinationService]
})
export class VaccinationModule {}
