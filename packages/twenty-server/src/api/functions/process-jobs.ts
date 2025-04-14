import { NestFactory } from '@nestjs/core';

import { VercelRequest, VercelResponse } from '@vercel/node';

import { AppModule } from '../../../app.module';
import { UpstashDriver } from '../../../engine/core-modules/message-queue/drivers/upstash/upstash.driver';
import { MessageQueue } from '../../../engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from '../../../engine/core-modules/message-queue/services/message-queue.service';

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    // Create a standalone NestJS application context for processing jobs
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get the message queue service from the application context
    const messageQueueService = app.get(MessageQueueService);

    // Get the queues to process from the request (or process all if not specified)
    let queues: MessageQueue[] = Object.values(MessageQueue);

    if (req.query.queue && typeof req.query.queue === 'string') {
      queues = [req.query.queue as MessageQueue];
    }

    const results: Record<string, number> = {};

    // Process jobs for each queue
    for (const queueName of queues) {
      const queueDriver = messageQueueService.getDriver(
        queueName,
      ) as UpstashDriver;

      // Only process if it's an Upstash driver
      if (queueDriver instanceof UpstashDriver) {
        const processedCount = await queueDriver.processJobs(queueName);

        results[queueName] = processedCount;
      } else {
        results[queueName] = 0;
      }
    }

    await app.close();

    // Return the processing results
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: results,
    });
  } catch (error) {
    console.error('Error processing jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
