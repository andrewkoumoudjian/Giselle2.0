# TwentyCRM Vercel Deployment Implementation Guide

This document provides a comprehensive overview of the implementation strategy for deploying TwentyCRM on Vercel, focusing on the key modifications made to migrate from a traditional server deployment to Vercel's serverless architecture.

## 1. Architecture Overview

### 1.1 Frontend Deployment
- **Static Assets**: The React frontend is built and placed in a `public/` directory for Vercel to serve as static files
- **Client-Side Routing**: Added fallback routing to ensure SPA routes work correctly when accessed directly via URL

### 1.2 Backend Deployment
- **Serverless Functions**: NestJS API endpoints are deployed as Vercel serverless functions in the `api/` directory
- **GraphQL Endpoint**: The main GraphQL API is available at `/api/graphql`

### 1.3 Background Jobs
- **QStash Integration**: Replaced always-on worker process with Upstash QStash for reliable background job processing
- **Serverless Job Handlers**: Added dedicated serverless functions to process background tasks asynchronously
- **Scheduled Jobs**: Implemented Vercel cron functions for periodic tasks like data cleanup and daily digests

## 2. Key Components

### 2.1 Serverless API Handlers
- **api/graphql.js**: Handles GraphQL API requests
- **api/applications.js**: Processes application-specific API requests
- **api/job-runner.js**: Processes background jobs triggered by QStash
- **api/scheduled-job.js**: Runs daily scheduled tasks via Vercel cron

### 2.2 Serverless Job Architecture
- **ServerlessJobService**: Manages communication with QStash for enqueueing jobs
- **JobRunnerService**: Processes various job types when triggered by QStash
- **ServerlessJobsModule**: Ties together job-related services and provides them to the application

## 3. Background Job Processing

### 3.1 How Background Jobs Work
1. When a user action requires async processing (e.g., AI analysis, bulk operations):
   - The API endpoint handles the immediate response to the user
   - It enqueues a background job using ServerlessJobService
   - A message is sent to QStash with job details
   
2. QStash later invokes the `/api/job-runner` endpoint with:
   - The job type (e.g., 'analyzeResume', 'processEmail')
   - The payload containing job-specific data
   - A signature header to verify authenticity

3. The job-runner function:
   - Verifies the request came from QStash
   - Processes the job based on its type
   - Stores results (typically in the database)

4. The frontend can:
   - Poll for job status updates
   - Display results when available
   - Notify the user upon completion

### 3.2 Scheduled Tasks
Vercel's cron functionality automatically invokes the scheduled-job function daily, which processes maintenance tasks like:
- Data cleanup
- Daily digest generation 
- Analytics aggregation

## 4. NX Remote Cache Configuration

The project is configured to use Vercel's Remote Cache for NX, which:
- Speeds up build times by reusing cached artifacts
- Ensures consistent builds across deployments
- Eliminates the need for a separate Nx Cloud account

## 5. Environment Configuration

To deploy this project, several environment variables must be configured in Vercel:
- **Core Variables**: Database, Redis, frontend URL
- **QStash Variables**: Token and signing keys for background jobs
- **NX Cache Variables**: For optimized builds
- **Supabase Variables**: For database and auth integration

Refer to VERCEL_ENVIRONMENT_VARIABLES.md for the complete list and setup instructions.

## 6. Maintenance Considerations

### 6.1 Monitoring and Debugging
- Check Vercel function logs for serverless function errors
- Monitor QStash dashboard for message delivery issues
- Use Upstash Redis metrics to track cache usage

### 6.2 Scaling Considerations
- Vercel functions have execution limits (duration and memory)
- Very heavy operations should be broken down into smaller chunks
- Consider increasing function memory/timeout for resource-intensive jobs

### 6.3 Cold Start Optimization
- For critical endpoints, consider implementing warming strategies
- Use QStash's retry capability for resilience
- Optimize NestJS initialization for faster cold starts

## 7. Future Improvements

### 7.1 Storage Strategy
- Current implementation uses 'local' storage which is limited on serverless
- Future versions should implement direct Supabase storage integration

### 7.2 WebSockets Support
- Current implementation does not support persistent WebSocket connections
- Consider using Vercel's edge functions or a third-party service for real-time features

### 7.3 Job Monitoring
- Implement a job monitoring dashboard for visibility into background processing
- Add more robust error handling and notification for failed jobs

## 8. Conclusion

This implementation provides a complete solution for running TwentyCRM on Vercel's serverless platform, replacing the traditional always-on server architecture with a more scalable event-driven approach. The key innovation is the replacement of the persistent worker process with QStash-triggered serverless functions, enabling reliable background processing without the constraints of traditional server deployments.