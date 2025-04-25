// Re-exporting the applications handler from the twenty-server package
import handler from '../packages/twenty-server/api/applications';

// Preserve the original configuration
export const config = {
  maxDuration: 10 // 10 seconds max execution time
};

export default handler;