import { Module } from '@nestjs/common';
import { EnvironmentModule } from '../config/environment.module';
import { RedisPubSubService } from './redis-pub-sub.service';

@Module({
  imports: [EnvironmentModule],
  providers: [RedisPubSubService],
  exports: [RedisPubSubService]
})
export class RedisPubSubModule {}
