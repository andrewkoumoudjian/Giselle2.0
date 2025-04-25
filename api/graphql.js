// Proxy file for Vercel serverless deployment
export { handler as default } from '../packages/twenty-server/dist/api/graphql.js';

// Preserve the original configuration
export const config = {
  maxDuration: 10 // 10 seconds max execution time
};