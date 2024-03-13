import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitIncreasementPolicyModule } from '../../benefit-increasement-policy/benefit-increasement-policy.module';
import { CompanyStructureComponentController } from './company-structure-component.controller';
import { CompanyStructureComponentService } from './company-structure-component.service';
import { CompanyStructureComponent } from './entities/company-structure-component.entity';

@Module({
  controllers: [CompanyStructureComponentController],
  providers: [CompanyStructureComponentService],
  imports: [
    TypeOrmModule.forFeature([CompanyStructureComponent]),
    BenefitIncreasementPolicyModule
  ],
  exports: [CompanyStructureComponentService]
})
export class CompanyStructureComponentModule {}
