# Vercel Deployment Guide

This guide provides instructions for deploying this project to Vercel.

## Prerequisites

- A Vercel account
- Git repository with this codebase

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

3. **Environment Variables**

   Set the following environment variables in your Vercel project settings:

   ```
   NODE_VERSION=20.x
   ```

4. **Deploy**

   Click "Deploy" and wait for the build to complete.

## How This Deployment Works

The deployment is configured to work with Vercel's build system:

1. **vercel.json Configuration**:
   - Uses `@vercel/static-build` for the frontend
   - Uses `@vercel/node` for the API functions
   - Specifies the output directory for the frontend as `dist/packages/twenty-front`
   - Sets up routes for API and frontend

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
