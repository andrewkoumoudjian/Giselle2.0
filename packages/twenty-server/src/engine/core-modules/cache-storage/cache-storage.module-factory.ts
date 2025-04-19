import { CacheModuleOptions } from '@nestjs/common';

import { redisStore } from 'cache-manager-redis-yet';

import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const cacheStorageModuleFactory = (
  twentyConfigService: TwentyConfigService,
): CacheModuleOptions => {
  const cacheStorageType = CacheStorageType.Redis;
  const cacheStorageTtl = twentyConfigService.get('CACHE_STORAGE_TTL');
  const cacheModuleOptions: CacheModuleOptions = {
    isGlobal: true,
    ttl: cacheStorageTtl * 1000,
  };

  switch (cacheStorageType) {
    /* case CacheStorageType.Memory: {
      return cacheModuleOptions;
    }*/
    case CacheStorageType.Redis: {
      const redisUrl = getRedisUrl(twentyConfigService);

      if (!redisUrl) {
        throw new Error(
          `${cacheStorageType} cache storage requires Redis connection information, check your .env file`,
        );
      }

      return {
        ...cacheModuleOptions,
        store: redisStore,
        url: redisUrl,
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${cacheStorageType}), check your .env file`,
      );
  }
};

// Helper function to get Redis URL from various environment variables
function getRedisUrl(twentyConfigService: TwentyConfigService): string | undefined {
  // First check if REDIS_URL is directly set
  const redisUrl = twentyConfigService.get('REDIS_URL');
  if (redisUrl) {
    return redisUrl;
  }

  // Otherwise try to construct from host and password
  const redisHost = twentyConfigService.get('REDIS_HOST');
  const redisPassword = twentyConfigService.get('REDIS_PASSWORD');

  if (!redisHost) {
    return undefined;
  }

  // Construct URL with optional password
  if (redisPassword) {
    return `redis://:${redisPassword}@${redisHost}:6379`;
  }

  return `redis://${redisHost}:6379`;
}
