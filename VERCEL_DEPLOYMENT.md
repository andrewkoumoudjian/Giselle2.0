# Vercel Deployment Guide

This document outlines the configuration for deploying the giselle2.5 monorepo to Vercel, including best practices, environment setup, and troubleshooting steps.

## Deployment Configuration

### Workspace & Monorepo Structure

This project uses Yarn v4 workspaces configured in an array format:
```json
"workspaces": [
  "packages/twenty-chrome-extension",
  "packages/twenty-front",
  "packages/twenty-server",
  // ...additional packages
]
```

### Build Process

The build process is orchestrated through Nx with optimized remote caching via Vercel:
1. `yarn build:all` - Builds all workspace packages
2. Individual build scripts are available per package (e.g., `yarn build:front`, `yarn build:server`)

### Vercel-Specific Configuration

The `vercel.json` file configures:
- Memory allocation (1024MB) for serverless functions
- Function timeout (10 seconds)
- Region deployment (iad1 - N. Virginia)
- Clean URLs for improved routing

## Environment Variables

The following environment variables must be set in the Vercel dashboard:

### Authentication & API
- `REACT_APP_SERVER_BASE_URL` - API endpoint URL
- `APP_SECRET` - For JWT authentication
- `FRONT_BASE_URL` - URL of the frontend application

### Database
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### Redis
- `REDIS_URL` - Connection URL for Redis

### Nx Remote Caching
- `VERCEL_ACCESS_TOKEN` - OAuth token for Vercel API
- `VERCEL_TEAM_ID` - Your Vercel team identifier

## CI/CD Workflow

1. Push to the repository
2. Vercel automatically starts the build process
3. `yarn build:all` executes, building all packages 
4. Function routes are established for serverless handlers
5. Deployment completes to the configured region

## Troubleshooting

### Common Deployment Issues

- **Memory Errors**: If you see timeouts or OOM errors, you may need to increase the memory allocation in vercel.json
- **Build Failures**: Check Nx cache settings and ensure the build command is completing successfully locally
- **Environment Variables**: Verify all required environment variables are set in the Vercel dashboard

### Performance Optimization

- Nx remote caching is enabled for faster builds
- Function memory is set to 1024MB for optimal performance
- Region is set to iad1 for reduced latency in North America

## Maintenance

- Periodically check for outdated dependencies
- Run `yarn audit` to detect security vulnerabilities
- Update Node.js version when Vercel updates its runtime support