# Vercel Environment Variables for TwentyCRM with QStash Integration

This document outlines all the necessary environment variables required to properly deploy TwentyCRM on Vercel with background job processing via Upstash QStash.

## Core Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| FRONTEND_URL | The URL of your deployed frontend | `https://your-app.vercel.app` | Yes |
| PG_DATABASE_URL | PostgreSQL connection string | `postgres://user:password@host:5432/dbname` | Yes |
| REDIS_URL | Redis connection URL | `redis://username:password@host:port` | Yes |

## Authentication & Security

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| ENCRYPTION_SECRET | Secret used for encryption | `your-long-random-string` | Yes |
| ACCESS_TOKEN_SECRET | Secret for signing JWT tokens | `your-long-random-string` | Yes |
| LOGIN_TOKEN_SECRET | Secret for login tokens | `your-long-random-string` | Yes |

## QStash Configuration (for Background Jobs)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| QSTASH_TOKEN | Your Upstash QStash API token | `q-xxxxxx` | Yes, for background jobs |
| QSTASH_CURRENT_SIGNING_KEY | Current signing key to verify requests from QStash | `sig_xxxxxx` | Yes, for background jobs |
| QSTASH_NEXT_SIGNING_KEY | Next signing key (for key rotation) | `sig_xxxxxx` | No |

## Vercel Remote Cache for NX

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| NX_VERCEL_REMOTE_CACHE_TOKEN | Vercel access token for remote cache | `xxxxx` | No, but recommended |
| NX_VERCEL_REMOTE_CACHE_TEAM | Vercel team ID for remote cache | `team_xxxxx` | No |
| NX_CACHE_URL | URL for Vercel's remote cache | `https://nx-cache.vercel.app` | No, but recommended |
| NX_REMOTE_CACHE | Enable remote caching | `true` | No, but recommended |

## Frontend Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| VITE_API_URL | API endpoint for GraphQL API | `/api/graphql` | Yes |
| VITE_BUILD_SOURCEMAP | Generate sourcemaps | `false` | No |

## Storage Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| STORAGE_TYPE | Type of storage to use | `local` | Yes |
| STORAGE_LOCAL_PATH | Path for local storage (if using local) | `/tmp/storage` | No |

## Supabase Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| SUPABASE_URL | Supabase project URL | `https://xxxxx.supabase.co` | Yes, if using Supabase |
| SUPABASE_ANON_KEY | Supabase anonymous key | `eyJxxxxxx` | Yes, if using Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | `eyJxxxxxx` | Yes, if using Supabase |

## Setting Up QStash

To enable background job processing on Vercel, follow these steps:

1. **Create an Upstash account** and set up a QStash project at https://upstash.com/

2. **Get your QStash credentials**:
   - QSTASH_TOKEN: Find this in the QStash dashboard
   - QSTASH_CURRENT_SIGNING_KEY: Found in QStash settings under "Signing Keys"
   - QSTASH_NEXT_SIGNING_KEY: Optional second key for key rotation

3. **Add these variables to Vercel**:
   - Go to your Vercel project settings → Environment Variables
   - Add the QStash variables with their respective values
   - Make sure to mark them as "Production" and optionally "Preview" environments

4. **Testing QStash integration**:
   - After deployment, trigger an action that uses background processing (e.g., bulk operations)
   - Check Vercel logs for the job-runner function to confirm it's being invoked
   - Verify in the QStash dashboard that messages are being sent and delivered

## Setting Up NX Remote Cache

For optimal build performance, configure Vercel's Remote Cache for NX:

1. **Generate Vercel token** with appropriate permissions

2. **Add NX cache variables** to Vercel environment variables

3. **Enable "Nx Vercel Remote Cache"** in Vercel project settings if available

4. **Verify** that builds are using the cache by checking build logs for cache hits