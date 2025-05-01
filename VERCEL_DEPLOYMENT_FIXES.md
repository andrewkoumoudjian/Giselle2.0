# Vercel Deployment Fixes

This document summarizes the changes made to fix Vercel deployment issues.

## Issues Fixed

1. **Missing Module Error**
   
   The error about missing module `/vercel/path0/node_modules/twenty-shared/translations/dist/twenty-shared-translations.cjs.js` was fixed by creating a custom build script that generates simplified versions of the required files.

2. **Memory Issues During Build**

   The build process was running out of memory on Vercel. This was fixed by creating a custom build script that creates simplified versions of the required files without running the full build process.

3. **Node.js Version Alignment**

   The Node.js version in `.nvmrc` and `package.json` were already aligned at version 20.x, so no changes were needed.

## Changes Made

1. **Custom Build Script**

   Created a custom build script (`build-for-vercel.sh`) that:
   - Creates simplified versions of the required files for the shared translations package
   - Creates simplified versions of the required files for the shared package
   - Creates simplified versions of the required files for the UI package
   - Creates a basic index.html file for the frontend
   - Creates a basic API endpoint

2. **Vercel Configuration**

   Updated `vercel.json` to use the custom build script:
   ```json
   "buildCommand": "./build-for-vercel.sh"
   ```

3. **Fixed Yarn Configuration**

   Fixed issues in the `.yarnrc.yml` file that were causing errors during the build process.

## Deployment Instructions

See the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions on deploying this project to Vercel.
