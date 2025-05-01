# Vercel Deployment Guide for Giselle 2.5

This guide provides instructions for deploying the Giselle 2.5 Nx monorepo to Vercel.

## Deployment Configuration

### Prerequisites

- A Vercel account
- Node.js 20.x (as specified in `.nvmrc`)
- Yarn 4.4.0 (configured automatically during build)

### Key Files

1. **vercel.json**: Configures the Vercel deployment with proper builds and rewrites
2. **setup-yarn.js**: Ensures Yarn 4.4.0 is used for package management
3. **fix-nx-plugins.js**: Installs required Nx plugins at the correct version
4. **ensure-translations-build.js**: Guarantees the shared translations package builds correctly
5. **vercel-build-script.js**: Handles the build process for Vercel deployment

## Troubleshooting Common Issues

### Missing Module Error

If you encounter an error about missing module `/vercel/path0/node_modules/twenty-shared/translations/dist/twenty-shared-translations.cjs.js`, the `ensure-translations-build.js` script should fix this by creating the required files.

### Yarn Resolution Errors

If you see Yarn resolution errors (YN0082), the `setup-yarn.js` script ensures that Yarn 4.4.0 is properly configured, which should resolve these issues.

### Nx Plugin Issues

If you encounter errors related to missing Nx plugins, the `fix-nx-plugins.js` script will install the required plugins at the correct version.

## Environment Variables

Make sure to set the following environment variables in your Vercel project:

- `NX_VERCEL_REMOTE_CACHE_TOKEN`: Your Vercel access token for remote caching
- `NX_VERCEL_REMOTE_CACHE_TEAM`: Your Vercel team ID (if applicable)

## Deployment Steps

1. Push your code to GitHub
2. Create a new project in Vercel
3. Link your GitHub repository
4. Configure the build settings:
   - Build Command: `yarn vercel-build`
   - Output Directory: Leave empty (configured in vercel.json)
   - Install Command: Leave empty (handled by vercel-build)
   - Node.js Version: 20.x
5. Add the required environment variables
6. Deploy!

## Monitoring

After deployment, monitor your application logs in the Vercel dashboard for any issues.

## Local Testing

To test the build process locally before deploying to Vercel:

```bash
# Install dependencies
yarn install

# Run the build process
yarn vercel-build

# Test the build locally
npx vercel dev
```
