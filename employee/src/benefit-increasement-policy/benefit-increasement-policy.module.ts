import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitComponentModule } from '../benefit-component/benefit-component.module';
import { BenefitIncreasementPolicyService } from './benefit-increasement-policy.service';
import { BenefitIncreasementPolicyController } from './benefit-increasement-policy.controller';
import { BenefitIncreasementPolicy } from './entities/benefit-increasement-policy.entity';
import { BenefitIncreasementPolicyDetail } from './entities/benefit-increasement-policy-detail.entity';

@Global()
@Module({
  controllers: [BenefitIncreasementPolicyController],
  providers: [BenefitIncreasementPolicyService],
  imports: [
    TypeOrmModule.forFeature([
      BenefitIncreasementPolicy,
      BenefitIncreasementPolicyDetail
    ]),
    BenefitComponentModule
  ],
  exports: [BenefitIncreasementPolicyService]
})
export class BenefitIncreasementPolicyModule {}
