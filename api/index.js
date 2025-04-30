// This file serves as a directory for all serverless functions
// that will be automatically discovered by Vercel

// Import handlers from your compiled server code
export { handler as applications } from '../packages/twenty-server/dist/api/applications.js';
export { handler as graphql } from '../packages/twenty-server/dist/api/graphql.js';
export { handler as jobRunner } from '../packages/twenty-server/dist/api/job-runner.js';
export { handler as scheduledJob } from '../packages/twenty-server/dist/api/scheduled-job.js';

// Define maxDuration for all functions
export const config = {
  maxDuration: 10
};