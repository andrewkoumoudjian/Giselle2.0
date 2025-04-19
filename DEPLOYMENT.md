# Deployment Guide

This document provides instructions for deploying this application to Vercel.

## Prerequisites

Before deployment, ensure you have:

1. A Vercel account
2. Access to the required environment variables:
   - Database credentials
   - Supabase credentials
   - Redis credentials

## Environment Variables

The following environment variables must be configured in your Vercel project:

### Database Configuration
- `POSTGRES_URL` or `DB_URL`: Your PostgreSQL connection string

### Supabase Configuration
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Redis Configuration (One of the following)
- `REDIS_URL`: Full Redis connection URL
- OR
- `REDIS_HOST`: Redis host address
- `REDIS_PASSWORD`: Redis password (if applicable)

## Deployment Steps

### Option 1: Deploying from GitHub

1. Connect your GitHub repository to Vercel
2. During project creation, configure all required environment variables
3. Select Node.js 18.x as the Node.js version
4. Deploy the project

### Option 2: Deploying with Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. From the project root directory, run: `vercel`
3. Follow the prompts to link your project
4. Set up the required environment variables when prompted

## Post-Deployment Verification

After deployment, verify:

1. The frontend is accessible at your Vercel deployment URL
2. The API endpoints are working
3. Database connections are established
4. Authentication flows are operational

## Troubleshooting

If you encounter issues:

1. Check Vercel build logs for errors
2. Verify all environment variables are correctly set
3. Ensure Redis and PostgreSQL services are accessible from Vercel
4. Check that Supabase credentials have the correct permissions

## Build Process

Our build process:

1. Sets up the necessary environment variables
2. Creates the twenty-ui module directories
3. Builds the shared package
4. Builds the UI package
5. Builds the frontend package

The build process is handled by `build.js` in the root directory.

## Monitoring

After deployment, monitor your application using:

1. Vercel Analytics
2. Server logs
3. Database performance metrics

## Contact

For deployment issues, please contact the development team. 