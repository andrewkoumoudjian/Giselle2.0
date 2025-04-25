// Re-exporting the GraphQL handler from the twenty-server package
export { handler } from '../packages/twenty-server/dist/api/graphql.js';

// Preserve the original configuration
export const config = {
  maxDuration: 10 // 10 seconds max execution time
};