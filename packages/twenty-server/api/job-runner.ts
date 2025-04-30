import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestFactory } from '@nestjs/core';

import { WorkspaceManagerModule } from '../src/workspace/workspace-manager/workspace-manager.module';
import { HealthModule } from '../src/health/health.module';
import { LoggerModule } from '../src/integrations/logger/logger.module';
import { DataSourceModule } from '../src/database/data-source/data-source.module';
import { CoreModule } from '../src/core/core.module';
import { MessagingModule } from '../src/integrations/messaging/messaging.module';
import { EventModule } from '../src/integrations/event/event.module';
import { FileModule } from '../src/core/file/file.module';
import { ServerlessJobsModule } from '../src/serverless-jobs/serverless-jobs.module';
import { JobRunnerService } from '../src/serverless-jobs/job-runner.service';
import { ServerlessJobService } from '../src/serverless-jobs/serverless-job.service';

// Import any modules needed for specific job types
import { AbilityModule } from '../src/ability/ability.module';
import { PersonModule } from '../src/modules/person/person.module';
import { CompanyModule } from '../src/modules/company/company.module';
// Add other modules as needed for your specific job requirements

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    DataSourceModule,
    CoreModule,
    WorkspaceManagerModule,
    TypeOrmModule,
    HealthModule,
    MessagingModule,
    EventModule,
    FileModule,
    AbilityModule,
    PersonModule,
    CompanyModule,
    ServerlessJobsModule,
    // Add other modules needed for job processing
  ],
  controllers: [],
  providers: [],
})
export class JobRunnerModule {}

export const jobRunnerModule = {
  path: '/api/job-runner',
  module: JobRunnerModule,
  handler: async (req, res) => {
    try {
      // Create a one-time Nest application context for processing this job
      const app = await NestFactory.createApplicationContext(JobRunnerModule);

      // Get the services we need
      const jobRunnerService = app.get(JobRunnerService);
      const serverlessJobService = app.get(ServerlessJobService);

      // Skip verification in development mode
      const isDev = process.env.NODE_ENV === 'development';

      // Verify the request came from QStash if not in development
      if (!isDev) {
        const signature = req.headers['upstash-signature'];

        if (!signature) {
          res.status(401).json({ message: 'Missing QStash signature' });
          await app.close();

          return;
        }

        const requestBody = JSON.stringify(req.body);
        const isValid = serverlessJobService.verifySignature(
          signature,
          requestBody,
        );

        if (!isValid) {
          res.status(401).json({ message: 'Invalid QStash signature' });
          await app.close();

          return;
        }
      }

      // Extract job details from request
      const { jobType, payload } = req.body;

      // Process the job
      const result = await jobRunnerService.processJob(jobType, payload);

      // Close the application context when done
      await app.close();

      // Return success response
      res.status(200).json({
        success: true,
        message: `Job ${jobType} processed successfully`,
        result,
      });
    } catch (error) {
      console.error('Error processing job:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing job',
        error: error.message,
      });
    }
  },
};
