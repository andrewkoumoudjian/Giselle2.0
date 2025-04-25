# Vercel Deployment Guide

This guide covers the deployment of the Twenty application on Vercel.

## Project Configuration

We've optimized the project for Vercel deployment with the following changes:

### Node.js Version

The project is configured to use Node.js 18.x:
- .nvmrc file specifies 18.17.1
- package.json "engines" field sets "node": "18.x"
- vercel.json specifies "runtime": "nodejs18.x"

### Yarn Configuration

To ensure compatibility with Vercel serverless functions:
- We use Yarn 4 with the node_modules linker mode
- `.yarnrc.yml` includes `nodeLinker: "node-modules"` to disable Plug'n'Play mode for better Vercel compatibility

### Vercel Configuration

In `vercel.json`, we've configured:

```json
{
  "version": 2,
  "buildCommand": "yarn build:all",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 10
    },
    "packages/twenty-server/api/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "cleanUrls": true
}
```

### API Routes

API routes are defined in:
- `api/applications.ts` - Re-exports the handler from `packages/twenty-server/api/applications.ts`
- `api/graphql.ts` - Re-exports the handler from `packages/twenty-server/api/graphql.ts`

## Environment Variables

Required environment variables for Vercel:

```
# Database
PG_DATABASE_URL=
POSTGRES_HOST=
POSTGRES_PORT=5432
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

# Redis (for caching)
REDIS_URL=

# Frontend URL for CORS
FRONTEND_URL=

# Authentication
ENCRYPTION_SECRET=
ACCESS_TOKEN_SECRET=
LOGIN_TOKEN_SECRET=

# For OAuth integrations
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Messaging
MESSAGING_PROVIDER=

# Supabase (if using)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# For CI/CD
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
SUPABASE_PROJECT_REF=
SUPABASE_ACCESS_TOKEN=
```

## GitHub Actions Deployment

We've added a GitHub Actions workflow for automated deployments:
- Runs on push to main/giselle2.5 branches
- Lints and tests the code
- Applies Supabase migrations
- Builds and deploys to Vercel

## Troubleshooting

If you encounter issues with the build:

1. **Duplicate exports**: Check barrel files for duplicate exports (e.g., in `packages/twenty-shared/src/utils/index.ts`)
2. **Dependency mismatches**: Ensure NestJS packages are all on compatible versions (v10.x)
3. **Memory limits**: Increase memory allocation in vercel.json if builds fail due to memory constraints

## Local Testing

To verify your build locally before deploying:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Run a local build test
vercel build
```

For more details, see [Vercel Serverless Functions documentation](https://vercel.com/docs/functions/serverless-functions).