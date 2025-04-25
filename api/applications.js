// Proxy file for Vercel serverless deployment
export { handler as default } from '../packages/twenty-server/dist/api/applications.js';

// Vercel specific configuration
export const config = {
  maxDuration: 10 // 10 seconds max execution time
};