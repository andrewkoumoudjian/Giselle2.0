import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ServerlessJobService } from './serverless-job.service';
import { JobRunnerService } from './job-runner.service';

/**
 * Module for serverless job processing
 * Provides services for enqueueing and processing background jobs in a serverless environment
 */
@Module({
  imports: [ConfigModule],
  providers: [ServerlessJobService, JobRunnerService],
  exports: [ServerlessJobService, JobRunnerService],
})
export class ServerlessJobsModule {}
