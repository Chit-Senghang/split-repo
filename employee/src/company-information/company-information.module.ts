import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../media/entities/media.entity';
import { CompanyInformationService } from './company-information.service';
import { CompanyInformationController } from './company-information.controller';
import { CompanyInformation } from './entities/company-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyInformation, Media])],
  controllers: [CompanyInformationController],
  providers: [CompanyInformationService],
  exports: [CompanyInformationService]
})
export class CompanyInformationModule {}
