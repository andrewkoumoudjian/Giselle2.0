// This file serves as a serverless function for processing background jobs
// It will be invoked by Upstash QStash when a job needs to be processed

import { createVercelHandler } from '../packages/twenty-server/dist/api/utils/create-vercel-handler';
import { jobRunnerModule } from '../packages/twenty-server/dist/api/job-runner';

export const handler = createVercelHandler(jobRunnerModule);

// Define config with longer maxDuration for processing jobs
export const config = {
  maxDuration: 30 // Longer timeout for background jobs
};