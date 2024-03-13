import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { Media } from '../media/entities/media.entity';
import { FingerprintDevice } from '../finger-print-device/entities/finger-print-device.entity';
import { BenefitIncreasementPolicyModule } from '../benefit-increasement-policy/benefit-increasement-policy.module';
import { CompanyStructureController } from './company-structure.controller';
import { CompanyStructureService } from './company-structure.service';
import { CompanyStructure } from './entities/company-structure.entity';
import { CompanyStructureComponent } from './company-structure-component/entities/company-structure-component.entity';
import { CompanyStructureComponentModule } from './company-structure-component/company-structure-component.module';

@Module({
  controllers: [CompanyStructureController],
  providers: [CompanyStructureService],
  imports: [
    CompanyStructureComponentModule,
    TypeOrmModule.forFeature([
      CompanyStructure,
      CompanyStructureComponent,
      PositionLevel,
      Media,
      FingerprintDevice
    ]),
    BenefitIncreasementPolicyModule
  ],
  exports: [CompanyStructureService]
})
export class CompanyStructureModule {}
