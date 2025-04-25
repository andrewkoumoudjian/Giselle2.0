# Vercel API Deployment

This document covers the requirements and configuration for deploying the Twenty server API on Vercel.

## Updates for giselle2.5

The following changes have been made to optimize deployment:

1. **Node.js 18.x**: Configuration aligned across .nvmrc, package.json engines, and vercel.json runtime
2. **NestJS v10**: All NestJS packages upgraded to v10 for compatibility with @graphql-yoga/nestjs
3. **Barrel Files**: Fixed duplicate exports in packages/twenty-shared/src/utils/index.ts by removing the isDefined.ts file which was causing conflicts with validation/isDefined.ts
4. **Yarn Configuration**: Added nodeLinker: "node-modules" to .yarnrc.yml for Vercel compatibility
5. **API Routes**: Fixed routing to include packages/twenty-server/api/*.ts handlers
6. **API Imports**: Updated API route handlers to import from compiled output (dist) rather than source files
7. **Barrel Generator**: Added a script to generate barrel files without duplicates via `yarn generate:barrels`

## API Server Requirements

1. **NestJS Framework**: The server uses NestJS v10 with GraphQL support
2. **Database**: PostgreSQL is required for data storage
3. **Redis**: Used for caching and message queuing
4. **Node.js**: v18.x is the recommended and tested version
5. **Serverless Configuration**: Optimized for Vercel serverless functions

## Vercel Configuration

The API servers are configured as serverless functions via:

```json
{
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
  }
}
```

## API Routes

The API exposes:

1. **GraphQL API**: Accessible via `/api/graphql`
2. **Applications API**: Accessible via `/api/applications`

## Environment Variables

The following environment variables must be set:

```
# Database Connection
PG_DATABASE_URL=postgres://user:password@host:5432/dbname

# Authentication
ENCRYPTION_SECRET=your-encryption-secret
ACCESS_TOKEN_SECRET=your-access-token-secret
LOGIN_TOKEN_SECRET=your-login-token-secret

# Frontend Configuration
FRONTEND_URL=https://your-frontend-url.com

# Cache Storage
REDIS_URL=redis://username:password@host:port

# (Optional) Supabase Integration
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# (Optional) QStash for background jobs
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

# (Optional) Google Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Deployment Process

1. Configure environment variables in Vercel dashboard
2. Push to the main branch to trigger deployment
3. Or use the GitHub Actions workflow we've provided for automated deployments

## Troubleshooting Build Errors

If you encounter "next build failed" or other build errors, check:

1. **Duplicate Exports**: Make sure there are no duplicate exports across barrel files
   - Run `yarn generate:barrels` to regenerate barrel files properly
2. **Path Imports**: Ensure imports point to compiled output (dist) rather than source files
3. **Memory Issues**: For large builds, increase Vercel's memory allocation
4. **Dependency Conflicts**: Resolve peer dependency issues, especially for NestJS packages

## Monitoring and Debugging

- Use Vercel's built-in logs for function execution monitoring
- Set up Sentry by configuring `SENTRY_DSN` environment variable
- Check server health via `/api/health` endpoint

If you encounter build or runtime issues, check:
1. Compatibility of dependencies (especially NestJS packages)
2. Memory limits for serverless functions
3. Database connection issues

For local testing, use Vercel CLI:
```bash
vercel dev
```