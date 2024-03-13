import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeographicService } from './geographic.service';
import { GeographicController } from './geographic.controller';
import { Geographic } from './entities/geographic.entity';

@Module({
  controllers: [GeographicController],
  providers: [GeographicService],
  imports: [TypeOrmModule.forFeature([Geographic])],
  exports: [GeographicService]
})
export class GeographicModule {}
