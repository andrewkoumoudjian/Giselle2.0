// This file serves as a directory for all serverless functions
// that will be automatically discovered by Vercel

export { default as applications } from './applications';
export { default as graphql } from './graphql';

// Define maxDuration for all functions
export const config = {
  maxDuration: 10
};