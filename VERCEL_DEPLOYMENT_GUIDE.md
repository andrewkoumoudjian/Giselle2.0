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

The deployment process follows these steps:

1. **Setup Environment**
   - Downgrade Yarn to 3.6.4 to avoid resolution issues
   - Configure Yarn to use node-modules linker
   - Install required Nx plugins
   - Run yarn install to update the lockfile

2. **Build Shared Packages**
   - Build twenty-shared-translations
   - Build twenty-shared
   - Build twenty-ui

3. **Build All Projects**
   - Use Nx to build all projects
   - Copy API handlers to the api directory
   - Copy frontend files to the public directory

4. **Vercel Deployment**
   - Serve static files from the public directory
   - Serve API functions from the api directory
   - Use rewrites to route requests appropriately

The deployment is configured to work with Vercel's build system:

1. **vercel.json Configuration**:
   - Uses functions for the API endpoints
   - Specifies the build command as `yarn build:all`
   - Specifies the output directory as `public`
   - Uses `rewrites` for API and frontend routing
   - Maintains `cleanUrls` for extensionless URLs

## Troubleshooting

### Missing Module Error

If you encounter an error about missing module `/vercel/path0/node_modules/twenty-shared/translations/dist/twenty-shared-translations.cjs.js`, the `ensure-translations-build.js` script should fix this by creating the required files.

### Yarn Resolution Errors

If you see Yarn resolution errors (YN0082), the `vercel-setup.js` script will downgrade Yarn to version 3.6.4, which should resolve these issues.

### Nx Plugin Issues

If you encounter errors related to missing Nx plugins, the `fix-nx-plugins.js` script will install the required plugins at the correct version.

### "No Output Directory named dist" Error

If you see this error, it means Vercel couldn't find the frontend files. Make sure the `vercel.json` file is correctly configured with the `outputDirectory` set to `public`.

### Node.js Version Issues

This project requires Node.js version 20.x. Make sure the `NODE_VERSION` environment variable is set correctly in your Vercel project settings.

### Memory Issues During Build

If you encounter memory issues during the build process, you can increase the memory limit for the API functions in the `vercel.json` file.

## Local Testing

To test the build process locally before deploying to Vercel:

```bash
# Install dependencies
yarn install

# Run the build process
yarn build:all

# Test the build locally
npx vercel dev
```

## Maintenance

After deployment, you can update your project by pushing changes to your GitHub repository. Vercel will automatically rebuild and redeploy your project.

## Monitoring

After deployment, monitor your application logs in the Vercel dashboard for any issues.
