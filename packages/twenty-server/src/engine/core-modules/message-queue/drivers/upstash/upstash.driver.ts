import { OnModuleDestroy } from '@nestjs/common';

import { v4 } from 'uuid';

import {
    QueueCronJobOptions,
    QueueJobOptions,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getJobKey } from 'src/engine/core-modules/message-queue/utils/get-job-key.util';

// Simplified interface for Upstash Redis Queue in serverless environment
export type UpstashQueueOptions = {
  url: string;
  token: string;
};

// This is a simplified version of the BullMQ driver adapted for serverless environment
// Instead of keeping persistent workers, it uses Vercel cron jobs to trigger processing
export class UpstashDriver implements MessageQueueDriver, OnModuleDestroy {
  private queueMap: Record<string, any> = {};
  
  constructor(private options: UpstashQueueOptions) {}

  register(queueName: MessageQueue): void {
    // In a serverless environment, we're just registering the queue name
    this.queueMap[queueName] = {
      name: queueName,
      options: this.options
    };
  }

  async onModuleDestroy() {
    // No persistent connections to close in serverless environment
  }

  async work<T>(
    queueName: MessageQueue,
    handler: (job: MessageQueueJob<T>) => Promise<void>,
    options?: MessageQueueWorkerOptions,
  ) {
    // In a serverless environment, workers are triggered via HTTP endpoints
    // The actual processing will happen when the Vercel cron job triggers the endpoint
    console.log(`Worker registration for queue ${queueName} acknowledged, but will be triggered via HTTP in serverless mode`);
  }

  async addCron<T>({
    queueName,
    jobName,
    data,
    options,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    data: T;
    options: QueueCronJobOptions;
    jobId?: string;
  }): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    // In serverless mode, we use Vercel cron jobs instead of BullMQ's repeat feature
    // Here we just store the job in Redis for the cron endpoint to pick up
    await this.storeJob(queueName, {
      id: jobId || v4(),
      name: jobName,
      data,
      options
    });
  }

  async removeCron({
    queueName,
    jobName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobId?: string;
  }): Promise<void> {
    // Since we're using Vercel cron, we need to mark the job as deleted in Redis
    const key = getJobKey({ jobName, jobId });
    await this.removeJob(queueName, key);
  }

  async add<T>(
    queueName: MessageQueue,
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    if (!this.queueMap[queueName]) {
      throw new Error(
        `Queue ${queueName} is not registered, make sure you have added it as a queue provider`,
      );
    }

    const jobId = options?.id ? `${options.id}-${v4()}` : v4();
    
    // Store the job in Redis for processing by the serverless function
    await this.storeJob(queueName, {
      id: jobId,
      name: jobName,
      data,
      options: {
        priority: options?.priority,
        retryLimit: options?.retryLimit || 0,
      }
    });
  }

  // Helper method to store jobs in Redis
  private async storeJob(queueName: string, job: any): Promise<void> {
    // This would use the Upstash Redis client to store the job
    // For now, this is a placeholder implementation
    console.log(`Storing job in queue ${queueName}:`, job);
    // In a real implementation, we would use:
    // await redis.set(`${queueName}:${job.id}`, JSON.stringify(job));
  }

  // Helper method to remove jobs from Redis
  private async removeJob(queueName: string, jobKey: string): Promise<void> {
    // This would use the Upstash Redis client to remove the job
    // For now, this is a placeholder implementation
    console.log(`Removing job from queue ${queueName} with key ${jobKey}`);
    // In a real implementation, we would use:
    // await redis.del(`${queueName}:${jobKey}`);
  }
}