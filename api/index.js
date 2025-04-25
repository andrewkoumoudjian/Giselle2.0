// This file serves as a directory for all serverless functions
// that will be automatically discovered by Vercel

// Import handlers from your compiled server code
export { handler as applications } from '../packages/twenty-server/dist/api/applications.js';
export { handler as graphql } from '../packages/twenty-server/dist/api/graphql.js';

// Define maxDuration for all functions
export const config = {
  maxDuration: 10
};