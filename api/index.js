// This file serves as a directory for all serverless functions
// that will be automatically discovered by Vercel

export { handler as applications } from './applications.js';
export { handler as graphql } from './graphql.js';

// Define maxDuration for all functions
export const config = {
  maxDuration: 10
};