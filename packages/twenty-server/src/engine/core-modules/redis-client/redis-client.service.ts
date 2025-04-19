import { Injectable, OnModuleDestroy } from '@nestjs/common';

import IORedis from 'ioredis';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
  private redisClient: IORedis | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getClient() {
    if (!this.redisClient) {
      const redisUrl = this.getRedisUrl();

      if (!redisUrl) {
        throw new Error('Redis connection URL could not be determined');
      }

      this.redisClient = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
      });
    }

    return this.redisClient;
  }

  private getRedisUrl(): string {
    // First check if REDIS_URL is directly set
    const redisUrl = this.twentyConfigService.get('REDIS_URL');
    if (redisUrl) {
      return redisUrl;
    }

    // Otherwise try to construct from host and password
    const redisHost = this.twentyConfigService.get('REDIS_HOST');
    const redisPassword = this.twentyConfigService.get('REDIS_PASSWORD');

    if (!redisHost) {
      throw new Error('Either REDIS_URL or REDIS_HOST must be provided');
    }

    // Construct URL with optional password
    if (redisPassword) {
      return `redis://:${redisPassword}@${redisHost}:6379`;
    }

    return `redis://${redisHost}:6379`;
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
  }
}
