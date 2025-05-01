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
     - Build Command: `./build-for-vercel.sh`
     - Output Directory: public

3. **Environment Variables**

   Set the following environment variables in your Vercel project settings:

   ```
   NODE_VERSION=20.x
   ```

4. **Deploy**

   Click "Deploy" and wait for the build to complete.

## Troubleshooting

### Missing Module Error

If you encounter an error about missing module `/vercel/path0/node_modules/twenty-shared/translations/dist/twenty-shared-translations.cjs.js`, it means the build process didn't correctly generate the required files. The custom build script (`build-for-vercel.sh`) in this repository should fix this issue by creating simplified versions of the required files.

### Node.js Version Issues

This project requires Node.js version 20.x. Make sure the `NODE_VERSION` environment variable is set correctly in your Vercel project settings.

### Memory Issues During Build

If you encounter memory issues during the build process, the custom build script (`build-for-vercel.sh`) should help by creating simplified versions of the required files without running the full build process.

## Maintenance

After deployment, you can update your project by pushing changes to your GitHub repository. Vercel will automatically rebuild and redeploy your project.
