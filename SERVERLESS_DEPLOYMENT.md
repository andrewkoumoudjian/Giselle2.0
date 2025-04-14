# Deploying to Vercel, Supabase, and Upstash Redis

This guide explains how to deploy the Giselle 2.0 application (based on Twenty CRM) to the following serverless platforms:

- **Vercel**: Frontend and serverless API functions
- **Supabase**: PostgreSQL database
- **Upstash Redis**: Caching and message queue

## Prerequisites

- Vercel account
- Supabase account
- Upstash account
- GitHub repository with your code

## Step 1: Set Up Supabase Database

1. Create a new project in Supabase
2. In your project, go to **Project Settings > Database**
3. Note down the connection string (in the format `postgres://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres`)
4. Run the database migrations:
   - Option 1: Use the Supabase SQL Editor to import the migration files
   - Option 2: Connect to the database using a tool like TablePlus and run migrations

## Step 2: Set Up Upstash Redis

1. Create a new Redis database in Upstash
2. Make sure to select the same region as your Vercel deployment
3. After creating the database, go to the **REST API** section
4. Note down the following values:
   - **UPSTASH_REDIS_URL** (endpoint URL)
   - **UPSTASH_REDIS_TOKEN** (token for authentication)

## Step 3: Deploy to Vercel

1. Import your GitHub repository to Vercel
2. Set up the following environment variables in the Vercel project settings:

```
IS_SERVERLESS=true
PG_DATABASE_URL=postgres://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
UPSTASH_REDIS_URL=https://[region].upstash.io/redis/[YOUR_REDIS_ID]
UPSTASH_REDIS_TOKEN=[YOUR_TOKEN]
FRONT_BASE_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
ACCESS_TOKEN_SECRET=[generate-a-strong-random-string]
REFRESH_TOKEN_SECRET=[generate-another-strong-random-string]
DATA_SOURCE_METADATA_TABLE_SCHEMA=public
DATA_SOURCE_CORE_TABLE_SCHEMA=public
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage
DEFAULT_ADMIN_EMAIL=[your-admin-email]
DEFAULT_ADMIN_PASSWORD=[strong-password]
SIGN_UP_ENABLED=true
TELEMETRY_ENABLED=false
```

3. Configure the build settings:
   - **Build Command**: `yarn && cd packages/twenty-front && yarn build`
   - **Output Directory**: `packages/twenty-front/dist`
   - **Install Command**: `yarn install`

4. Deploy your application

## Step 4: Run Database Migrations

After deployment, you'll need to run database migrations. Use one of these methods:

1. **Directly from Vercel console**: Go to Functions tab and trigger the migration serverless function
2. **Via API**: Make a POST request to `https://your-app.vercel.app/api/migrations/run`
3. **Manually**: Connect to your Supabase database and run the migration SQL files

## Step 5: Verify the Deployment

1. Visit your Vercel deployment URL
2. If you set `SIGN_UP_ENABLED=true`, create a new account
3. Otherwise, log in with the default admin credentials

## Troubleshooting

- **Database Connection Issues**:
  - Check that the Supabase database connection string is correct
  - Ensure the database is accessible from Vercel's IP addresses (set public access or add Vercel's IPs to allowlist)

- **Redis Connection Issues**:
  - Verify Upstash Redis credentials are correct
  - Check that the Redis instance is in the same region as your Vercel deployment

- **Serverless Function Timeouts**:
  - For long-running operations, use the queue system instead of direct API calls
  - Some operations may need to be refactored for serverless environments