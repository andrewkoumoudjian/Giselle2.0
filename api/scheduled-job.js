// This file serves as a serverless function for scheduled jobs
// It will be invoked by Vercel's cron system at the specified schedule

import { createVercelHandler } from '../packages/twenty-server/dist/api/utils/create-vercel-handler';
import { scheduledJobModule } from '../packages/twenty-server/dist/api/scheduled-job';

export const handler = createVercelHandler(scheduledJobModule);

// Set up cron schedule to run daily at midnight UTC
export const config = {
  schedule: '0 0 * * *',
  maxDuration: 30
};