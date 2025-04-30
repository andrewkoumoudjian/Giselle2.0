# TwentyCRM Vercel Deployment Checklist

This checklist provides step-by-step guidance for deploying TwentyCRM on Vercel using our serverless architecture. Following these steps will ensure all components are properly configured.

## Prerequisites

- [ ] Supabase account with a project set up
- [ ] Upstash account with Redis instance
- [ ] Upstash QStash set up for background jobs
- [ ] Vercel account with sufficient permissions
- [ ] GitHub repository with TwentyCRM codebase

## Pre-Deployment Setup

### Environment Variables
- [ ] Create `.env.production` or gather all required variables (see VERCEL_ENVIRONMENT_VARIABLES.md)
- [ ] Generate strong random strings for security tokens:
  ```bash
  # Run this command 3 times to generate 3 different keys
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Database Preparation
- [ ] Set up Supabase project
- [ ] Run all migrations in Supabase SQL editor
- [ ] Configure database access policies (if needed)
- [ ] Copy database connection URL

### Storage Preparation
- [ ] Create required buckets in Supabase Storage (if using)
- [ ] Configure bucket permissions

### QStash Setup
- [ ] Set up QStash in Upstash account
- [ ] Copy QStash token
- [ ] Copy QStash signing keys

## Vercel Deployment

### Initial Project Setup
- [ ] Link GitHub repository to Vercel
- [ ] Set framework preset to "Other"
- [ ] Set build command to `yarn build:all`
- [ ] Set output directory (if not using public/) to `dist/packages/twenty-front`

### Environment Variables
- [ ] Add all required environment variables in Vercel project settings
- [ ] Set `FRONTEND_URL` to your Vercel deployment URL (update after first deploy)
- [ ] Set `VITE_API_URL` to `/api/graphql`
- [ ] Configure database connection variables
- [ ] Add QStash variables
- [ ] Add NX Remote Cache variables (optional but recommended)

### Deploy
- [ ] Trigger initial deployment
- [ ] Monitor build logs for any errors
- [ ] Verify deployment completes successfully

## Post-Deployment Verification

### Frontend Verification
- [ ] Visit deployed URL and verify the frontend loads
- [ ] Test authentication (login/signup)
- [ ] Verify client-side routing works (navigation between pages)
- [ ] Check that static assets (images, etc.) load correctly

### API Verification
- [ ] Test GraphQL endpoint (`/api/graphql`) functionality
- [ ] Verify database connectivity by querying data
- [ ] Check authentication flows through the API

### Background Jobs Verification
- [ ] Trigger an action that creates a background job
- [ ] Check Vercel function logs to verify job-runner was invoked
- [ ] Verify QStash dashboard shows message delivery
- [ ] Confirm job results appear in the application

### Scheduled Jobs Verification
- [ ] Check Vercel's Cron jobs section to ensure scheduled-job is registered
- [ ] Manually trigger the scheduled job function to verify it works
- [ ] Check logs after the first scheduled run

## Performance Optimization

- [ ] Enable NX Remote Cache if not already
- [ ] Consider implementing caching strategies for frequent GraphQL queries
- [ ] Monitor cold start times and optimize if needed

## Security Verification

- [ ] Verify all sensitive environment variables are encrypted
- [ ] Test API endpoints for proper authentication
- [ ] Check that QStash signature verification is working

## Final Steps

- [ ] Set up custom domain (if needed)
- [ ] Configure DNS settings
- [ ] Set up monitoring and alerts
- [ ] Document any project-specific deployment details
- [ ] Update FRONTEND_URL if using a custom domain

## Troubleshooting Common Issues

### Build Failures
- Check for missing dependencies
- Verify NX configuration is correct
- Ensure correct Node.js version is used

### Missing Environment Variables
- Double-check all required variables are set
- Ensure variable names match exactly what the code expects

### Cold Start Issues
- Consider implementing warming strategies for critical endpoints
- Optimize NestJS initialization code

### Background Job Problems
- Verify QStash configuration
- Check function logs for errors
- Ensure correct URL is used for job-runner endpoint