import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReasonTemplateService } from './reason-template.service';
import { ReasonTemplateController } from './reason-template.controller';
import { ReasonTemplate } from './entities/reason-template.entity';
import { ReasonTemplateRepository } from './repository/reason-template.repository';

@Module({
  controllers: [ReasonTemplateController],
  providers: [ReasonTemplateService, ReasonTemplateRepository],
  exports: [ReasonTemplateService, ReasonTemplateRepository],
  imports: [TypeOrmModule.forFeature([ReasonTemplate])]
})
export class ReasonTemplateModule {}
