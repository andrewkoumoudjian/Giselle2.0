import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManagerModule } from '../src/workspace/workspace-manager/workspace-manager.module';
import { LoggerModule } from '../src/integrations/logger/logger.module';
import { DataSourceModule } from '../src/database/data-source/data-source.module';
import { CoreModule } from '../src/core/core.module';
import { NestFactory } from '@nestjs/core';
import { ServerlessJobsModule } from '../src/serverless-jobs/serverless-jobs.module';
import { JobRunnerService } from '../src/serverless-jobs/job-runner.service';

// Import modules needed for scheduled tasks
import { AbilityModule } from '../src/ability/ability.module';
import { PersonModule } from '../src/modules/person/person.module';
import { CompanyModule } from '../src/modules/company/company.module';

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
    AbilityModule,
    PersonModule,
    CompanyModule,
    ServerlessJobsModule,
  ],
  controllers: [],
  providers: [],
})
export class ScheduledJobModule {}

export const scheduledJobModule = {
  path: '/api/scheduled-job',
  module: ScheduledJobModule,
  handler: async (req, res) => {
    try {
      // Create a one-time Nest application context for processing scheduled jobs
      const app = await NestFactory.createApplicationContext(ScheduledJobModule);
      
      // Get the job runner service
      const jobRunnerService = app.get(JobRunnerService);
      
      // List of daily scheduled jobs to run
      const dailyJobs = [
        {
          jobType: 'dailyDigest',
          payload: { timestamp: new Date().toISOString() }
        },
        {
          jobType: 'dataCleanup',
          payload: { olderThanDays: 30 }
        },
        // Add other daily jobs as needed
      ];
      
      // Process each scheduled job
      const results = [];
      for (const job of dailyJobs) {
        try {
          const result = await jobRunnerService.processJob(job.jobType, job.payload);
          results.push({ 
            jobType: job.jobType, 
            success: true, 
            result 
          });
        } catch (error) {
          results.push({ 
            jobType: job.jobType, 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Close the application context when done
      await app.close();
      
      // Return results
      res.status(200).json({ 
        success: true, 
        message: 'Daily scheduled jobs processed',
        results
      });
    } catch (error) {
      console.error('Error processing scheduled jobs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error processing scheduled jobs', 
        error: error.message 
      });
    }
  },
};