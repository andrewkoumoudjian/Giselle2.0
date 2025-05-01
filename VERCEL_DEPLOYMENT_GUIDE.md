# Vercel Deployment Guide for Giselle 2.5

This guide provides instructions for deploying the Giselle 2.5 Nx monorepo to Vercel.

## Prerequisites

- A Vercel account
- Git repository with this codebase
- Node.js 20.x (as specified in `.nvmrc`)

## Key Files for Vercel Deployment

1. **vercel.json**: Configures the Vercel deployment with proper functions and rewrites
2. **vercel-setup.js**: Sets up the Vercel deployment environment, including downgrading Yarn
3. **fix-nx-plugins.js**: Installs required Nx plugins at the correct version
4. **ensure-translations-build.js**: Guarantees the shared translations package builds correctly

## Deployment Steps

1. **Fork or Clone the Repository**

   Make sure you have a copy of this repository in your own GitHub account.

2. **Connect to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project settings:
     - Framework Preset: Other
     - Root Directory: ./
     - Build Command: `yarn build:all`
     - Output Directory: Leave empty (configured in vercel.json)

3. **Environment Variables**

   Set the following environment variables in your Vercel project settings:

   ```
   NODE_VERSION=20.x
   NX_VERCEL_REMOTE_CACHE_TOKEN=your_vercel_token
   NX_VERCEL_REMOTE_CACHE_TEAM=your_team_id (if applicable)
   ```

4. **Deploy**

   Click "Deploy" and wait for the build to complete.

## How This Deployment Works

The deployment is configured to work with Vercel's build system:

1. **vercel.json Configuration**:
   - Uses `@vercel/static-build` for the frontend
   - Uses `@vercel/node` for the API functions
   - Specifies the output directory for the frontend as `dist/packages/twenty-front`
   - Embeds function configuration (memory and timeout) directly in the build entry
   - Uses `rewrites` instead of `routes` for API and frontend routing
   - Maintains `cleanUrls` for extensionless URLs
   - Follows Vercel's schema requirements by:
     - Avoiding the use of both `builds` and `functions` at the top level
     - Using `rewrites` instead of `routes` which is not compatible with other configuration options

2. **Custom Build Script**:
   - `build-for-vercel.sh` creates simplified versions of required files
   - Creates the necessary directory structure for Vercel to find the frontend and API files

## Troubleshooting

### Missing Module Error

If you encounter an error about missing module `/vercel/path0/node_modules/twenty-shared/translations/dist/twenty-shared-translations.cjs.js`, it means the build process didn't correctly generate the required files. The custom build script (`build-for-vercel.sh`) in this repository should fix this issue by creating simplified versions of the required files.

### "No Output Directory named dist" Error

If you see this error, it means Vercel couldn't find the frontend files. Make sure the `vercel.json` file is correctly configured with the `builds` section that specifies the output directory as `dist/packages/twenty-front`.

### Node.js Version Issues

This project requires Node.js version 20.x. Make sure the `NODE_VERSION` environment variable is set correctly in your Vercel project settings.

### Memory Issues During Build

If you encounter memory issues during the build process, the custom build script (`build-for-vercel.sh`) should help by creating simplified versions of the required files without running the full build process.

## Maintenance

After deployment, you can update your project by pushing changes to your GitHub repository. Vercel will automatically rebuild and redeploy your project.
