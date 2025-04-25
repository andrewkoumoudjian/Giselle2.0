# Vercel API Deployment Optimization

This document explains the optimizations made to ensure proper serverless function detection and deployment in Vercel.

## Key Changes Implemented

### 1. Top-Level API Directory

Vercel's serverless function detection only automatically discovers files located in a top-level `/api` directory. To address this, we've:

- Created a top-level `/api` directory
- Added re-export files that point to the actual implementations in `packages/twenty-server/api`

```typescript
// api/graphql.ts
import handler from '../packages/twenty-server/api/graphql';
export const config = { maxDuration: 10 };
export default handler;
```

### 2. Vercel.json Configuration

The vercel.json file has been updated to correctly target the top-level API directory:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

Note that we've removed the `runtime` specification, allowing Vercel to use its default Node.js runtime.

## Deployment Flow

1. When you push your code to Vercel, the build process (`yarn build:all`) runs first
2. After the build completes, Vercel scans for serverless functions in the top-level `/api` directory
3. These functions are compiled and deployed as serverless endpoints

## Troubleshooting

If you encounter issues with function detection:

1. Verify that the route path matches the file structure in the `/api` directory
2. Check that the re-export files correctly import the handlers from their original location
3. Ensure all necessary environment variables are set in the Vercel dashboard

## References

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions/serverless-functions)
- [Vercel API Routes with NestJS](https://vercel.com/guides/using-express-with-vercel)