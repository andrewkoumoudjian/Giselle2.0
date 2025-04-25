# Vercel Environment Variables for Twenty CRM Deployment

This document outlines all the necessary environment variables that should be configured in your Vercel project settings for optimal deployment of the Twenty CRM application.

## Database Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| POSTGRES_HOST | PostgreSQL server hostname | `db.supabase.co` | Yes | Yes |
| POSTGRES_PORT | PostgreSQL server port | `5432` | No (defaults to 5432) | No |
| POSTGRES_DATABASE | PostgreSQL database name | `twenty` | Yes | Yes |
| POSTGRES_USER | PostgreSQL username | `postgres` | Yes | Yes |
| POSTGRES_PASSWORD | PostgreSQL password | `your-password` | Yes | Yes |
| POSTGRES_URL | Full PostgreSQL connection string | `postgres://user:password@host:port/database` | Yes (if PG_DATABASE_URL not provided) | Yes |
| PG_DATABASE_URL | Alternative PostgreSQL connection URL | `postgres://user:password@host:port/database` | Yes (if individual params not provided) | Yes |
| PG_SSL_ALLOW_SELF_SIGNED | Allow self-signed SSL certificates | `false` | No | No |

## Cache Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| REDIS_URL | Redis connection URL | `redis://username:password@host:port` | Yes | Yes |
| CACHE_STORAGE_TTL | Cache time-to-live in seconds | `604800` (7 days) | No | No |

## Server Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| NODE_ENV | Node.js environment | `production` | No (defaults to production) | No |
| NODE_PORT | Node.js server port | `3000` | No (handled by Vercel) | No |
| SERVER_URL | Backend server URL | `https://your-app.vercel.app` | No (defaults to deployment URL) | No |
| FRONTEND_URL | Frontend URL | `https://your-app.vercel.app` | No (defaults to SERVER_URL) | No |
| APP_SECRET | Secret key for the application | `your-random-secret-key` | Yes | Yes |

## Storage Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| STORAGE_TYPE | Type of storage to use | `local` (For Vercel use local) | No | No |
| STORAGE_LOCAL_PATH | Path for local storage | `/tmp/.local-storage` | No (auto-configured for Vercel) | No |

## Authentication Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | `your-service-role-key` | Yes | Yes |
| SUPABASE_ANON_KEY | Supabase anonymous key | `your-anon-key` | Yes | Yes |
| AUTH_PASSWORD_ENABLED | Enable password authentication | `true` | No | No |

## Frontend Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| VITE_API_URL | GraphQL API endpoint for frontend | `/api/graphql` | Yes | No |
| VITE_BUILD_SOURCEMAP | Generate source maps | `false` | No | No |

## Function Configuration

| Variable | Description | Example | Required | Sensitive |
|----------|-------------|---------|----------|-----------|
| NX_CACHE_DIRECTORY | Directory for NX cache | `/tmp/nx-cache` | No | No |

## Notes

1. **Sensitive Variables**: Mark these as "sensitive" in the Vercel environment variable settings to ensure they're properly secured.
2. **Preview vs Production**: Some variables may need different values in preview vs. production environments.
3. **Ephemeral Filesystem**: Remember that Vercel functions use an ephemeral filesystem. Only `/tmp` is writable, and files will not persist between function invocations.
4. **Cold Starts**: The twenty-server application will experience cold starts. The initialization code in `applications.ts` and `graphql/index.ts` has been optimized to reduce this impact.

## Complete Required Setup

Ensure these variables are configured in the Vercel dashboard under:
Settings → Environment Variables

Add each variable and select the appropriate environments (Production, Preview, Development).