# Vercel Deployment Guide

This guide explains how to deploy this application on Vercel.

## Prerequisites

- A Vercel account
- Git repository with your code
- Database URL (PostgreSQL) for the backend

## Deployment Steps

1. **Set up environment variables in Vercel**

   Navigate to your project in the Vercel dashboard and add the following environment variables:

   ```
   # Required environment variables
   DATABASE_URL=your_database_url_here
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   FRONT_BASE_URL=https://your-vercel-domain.vercel.app
   
   # Additional settings
   VITE_DISABLE_TYPESCRIPT_CHECKER=true
   VITE_DISABLE_ESLINT_CHECKER=true
   NODE_OPTIONS="--max-old-space-size=6144"
   VERCEL_FORCE_NO_BUILD_CACHE=1
   NODE_ENV=production
   ```

2. **Deploy to Vercel**

   Connect your Git repository to Vercel and deploy. Vercel will use the `vercel.json` configuration to set up the build.

## Troubleshooting

If you encounter a blank page or API errors:

1. **Check Vercel logs**: Navigate to your deployment in the Vercel dashboard and check the logs for errors.

2. **Environment variables**: Ensure all required environment variables are set correctly.

3. **API routes**: Make sure your frontend is correctly calling the API with the right path (`/api/`).

4. **CORS issues**: Check for CORS errors in your browser's developer console.

## API Structure

The API is deployed as a serverless function in Vercel. All API requests should be directed to `/api`.

For example:
- GraphQL endpoint: `/api/graphql`
- API routes: `/api/your-endpoint`

## Frontend Configuration

The frontend is configured to call the API at the relative path `/api` which is then routed to the serverless function.

## Debugging

To enable additional debugging, set `DEBUG=true` in your environment variables. 