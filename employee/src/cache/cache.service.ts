import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import {
  CURRENT_USER_KEY,
  USER_MPATH_PREFIX
} from '../shared-resources/cache/cache-constants';
import { RedisPubSubService } from '../redis-pub-sub/redis-pub-sub.service';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisPubSubService: RedisPubSubService
  ) {}

  async getCurrentUser() {
    const userId = getCurrentUserFromContext();
    const key = CURRENT_USER_KEY + userId;
    return await this.cacheManager.get(key);
  }

  async getUserMpath() {
    const userId = getCurrentUserFromContext();
    const key = USER_MPATH_PREFIX + userId;
    return await this.cacheManager.get(key);
  }

  async deleteUserMpath(pattern: string[]) {
    if (pattern.length) {
      await this.redisPubSubService.redis.del(pattern);
      await this.redisPubSubService.publish();
    }
  }
}
