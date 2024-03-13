import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisPubSubService } from '../redis-pub-sub/redis-pub-sub.service';
import { EnvironmentModule } from '../config/environment.module';
import { EnvironmentService } from '../config/environment.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        store: (): any =>
          redisStore({
            name: 'redsStore',
            socket: {
              host: environmentService.getStringValue('REDIS_HOST'),
              port: environmentService.getNumberValue('REDIS_PORT')
            }
          }),
        ttl: 0
      }),
      inject: [EnvironmentService]
    })
  ],
  providers: [CacheService, RedisPubSubService],
  exports: [CacheService]
})
export class RedisCacheModule {}
