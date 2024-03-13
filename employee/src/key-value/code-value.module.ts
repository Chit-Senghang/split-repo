import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeValue, Code } from './entity';
import { CodeValueController } from './code-value.controller';
import { CodeValueService } from './code-value.service';
import { CodeValueRepository } from './repository/code-value.repository';

@Global()
@Module({
  providers: [CodeValueService, CodeValueRepository],
  exports: [CodeValueService, CodeValueRepository],
  imports: [TypeOrmModule.forFeature([CodeValue, Code])],
  controllers: [CodeValueController]
})
export class CodeValueModule {}
