import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AuthenticationService } from '../authentication/authentication.service';
import { DELETE_USER_MPATH_CHANNEL } from '../shared-resources/cache/cache-constants';

@Injectable()
export class RedisPubSubService {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  });

  constructor(private readonly authenticationService: AuthenticationService) {
    this.redis.on('error', (error: Error) => {
      Logger.log(error);
    });

    this.redis.subscribe(DELETE_USER_MPATH_CHANNEL);
    this.redis.on('message', async (channel: string, message: string) => {
      Logger.log(`You have subscribed to channel ${channel} successfully`);
      if (message) {
        await this.authenticationService.setEmployeeMpath(Number(message));
      }
    });
  }
}
