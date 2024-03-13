import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { DELETE_USER_MPATH_CHANNEL } from '../shared-resources/cache/cache-constants';
import { EnvironmentService } from '../config/environment.service';

@Injectable()
export class RedisPubSubService {
  constructor(private readonly environmentService: EnvironmentService) {}

  redis = new Redis({
    host: this.environmentService.getStringValue('REDIS_HOST'),
    port: this.environmentService.getNumberValue('REDIS_PORT')
  });

  handleErrorRedis() {
    this.redis.on('error', (error: Error) => {
      Logger.log(error);
    });
  }

  async publish(channelName = DELETE_USER_MPATH_CHANNEL) {
    const userId = getCurrentUserFromContext();
    if (userId) {
      const result = this.redis.publish(channelName, String(userId));
      if (result) {
        Logger.log(`You have published ${channelName} successfully`);
      }
    }
  }
}
