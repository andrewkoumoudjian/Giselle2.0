# Vercel Deployment Checklist

This document provides a comprehensive checklist for deploying your Giselle 2.5 application on Vercel, addressing all the issues identified in the audit.

## 1. Build Configuration ✅

Your `vercel.json` configuration is properly set up with:
- Version 2 specified
- `buildCommand` set to `yarn build:all`
- Functions configuration for `api/**/*.js` files with appropriate memory and duration limits
- Proper rewrites to handle API requests

## 2. API Handler Copying 🛠️

- The `copy-api-handlers` script in `package.json` has been updated to reference the correct path:
  ```json
  "copy-api-handlers": "mkdir -p api && cp -f dist/packages/twenty-server/api/*.js api/ || true"
  ```
- This ensures that after the NX build completes, the serverless function handlers will be properly copied to the `/api` directory that Vercel scans.

## 3. Database Environment Variables 🔑

To ensure the database connection works properly, make sure you have one of the following set in your Vercel environment variables:

- **Option 1**: Set `PG_DATABASE_URL` with your complete PostgreSQL connection string
- **Option 2**: The code now includes a fallback to use `POSTGRES_URL` if available
- **Option 3**: Set individual components (`POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.)

## 4. Supabase Environment Variables 🔑

Ensure the following Supabase environment variables are set in Vercel:
- `SUPABASE_URL` (e.g., https://your-project.supabase.co)
- `SUPABASE_ANON_KEY` (for client-side operations)
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

## 5. Other Required Environment Variables 🔑

Refer to the `.env.example` file for all required environment variables, including:
- Redis configuration (`REDIS_URL`)
- Security secrets (`ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `LOGIN_TOKEN_SECRET`)
- Frontend URL configuration (`FRONTEND_URL`)
- QStash configuration (if using background jobs)

## 6. Vercel Project Configuration ⚙️

In your Vercel project settings:
1. Under "General" → "Monorepo", toggle on "Enable Vercel Remote Caching for NX"
2. Under "Environment Variables", add all the required variables from the `.env.example` file
3. Ensure the "Build Command" matches what's in your `vercel.json` file

## 7. Post-Deployment Verification 🔍

After deployment, verify:
1. The frontend application loads correctly
2. API requests work (test a GraphQL query via the frontend)
3. Authentication flows function properly
4. Database connections are established
5. Supabase operations work as expected

## Troubleshooting Common Issues 🛠️

If you encounter issues after deployment:

1. **Missing API Handlers**: Check that the build log shows the copying of API handlers to the `/api` directory
2. **Database Connection Errors**: Verify database credentials and that `PG_DATABASE_URL` or its components are properly set
3. **Supabase Errors**: Ensure all Supabase environment variables are correctly set
4. **CORS Issues**: Check that `FRONTEND_URL` is properly set to allow cross-origin requests
5. **Build Failures**: Review the build logs for any package-specific build errors