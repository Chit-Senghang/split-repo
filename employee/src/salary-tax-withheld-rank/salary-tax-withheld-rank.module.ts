import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryTaxWithheldRankService } from './salary-tax-withheld-rank.service';
import { SalaryTaxWithheldRankController } from './salary-tax-withheld-rank.controller';
import { SalaryTaxWithheldRankRepository } from './repository/salary-tax-withheld-rank.repository';
import { SalaryTaxWithheldRank } from './entities/salary-tax-withheld-rank.entity';

@Module({
  controllers: [SalaryTaxWithheldRankController],
  providers: [SalaryTaxWithheldRankService, SalaryTaxWithheldRankRepository],
  imports: [TypeOrmModule.forFeature([SalaryTaxWithheldRank])]
})
export class SalaryTaxWithheldRankModule {}
