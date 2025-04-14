import {
    BullMQDriverFactoryOptions,
    MessageQueueDriverType,
    MessageQueueModuleOptions,
} from 'src/engine/core-modules/message-queue/interfaces';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Add Upstash type to MessageQueueDriverType
export enum ServerlessDriverType {
  Upstash = 'upstash',
}

/**
 * MessageQueue Module factory
 * @returns MessageQueueModuleOptions
 * @param twentyConfigService
 */
export const messageQueueModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  redisClientService: RedisClientService,
): Promise<MessageQueueModuleOptions> => {
  // Use environment variable to determine if we're running in serverless mode
  const isServerless = twentyConfigService.get('IS_SERVERLESS') === 'true';
  const nodeEnv = twentyConfigService.get('NODE_ENV');

  // For Vercel deployment, use Upstash driver
  if (isServerless) {
    const upstashUrl = twentyConfigService.get('UPSTASH_REDIS_URL');
    const upstashToken = twentyConfigService.get('UPSTASH_REDIS_TOKEN');

    if (!upstashUrl || !upstashToken) {
      throw new Error(
        `Serverless message queue requires UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN environment variables`,
      );
    }

    return {
      type: ServerlessDriverType.Upstash as any,
      options: {
        url: upstashUrl,
        token: upstashToken,
      },
    };
  }

  // For development/testing or traditional deployment, use BullMQ
  return {
    type: MessageQueueDriverType.BullMQ,
    options: {
      connection: redisClientService.getClient(),
    },
  } satisfies BullMQDriverFactoryOptions;
};
