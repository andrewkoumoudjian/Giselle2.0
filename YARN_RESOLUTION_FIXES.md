# Yarn Resolution Fixes for Vercel Deployment

This document explains the fixes implemented to resolve Yarn resolution and lockfile errors during Vercel deployment.

## Issues Fixed

1. **Yarn Resolution Error**

   The error `YN0082: @nx/js@npm:22.10.2: No candidates found` was occurring because Yarn couldn't resolve the plugin version. This typically happens when the Nx core version and the @nx/js plugin version are out of sync.

2. **Lockfile Error**

   The follow-on error `Internal Error: @nx/js@npm:22.10.2: This package doesn't seem to be present in your lockfile` confirmed that the lockfile wasn't updated with a valid plugin version.

3. **Node.js Version Inconsistency**

   There were inconsistencies in Node.js version specifications across different package.json files in the project, which could lead to cache invalidation and build errors.

## Changes Made

1. **Downgraded Yarn to Version 3.6.4**

   Created a `downgrade-yarn.js` script that:
   - Sets Yarn version to 3.6.4 using `yarn set version 3.6.4`
   - Updates the `packageManager` field in package.json to "yarn@3.6.4"
   - This addresses the known bug in Yarn 4.x that causes the "No candidates found" error

2. **Updated vercel-build Script**

   Modified the `vercel-build` script in package.json to:
   - Run the `downgrade-yarn.js` script first
   - Run `yarn install` to regenerate the lockfile with Yarn 3.6.4
   - Then proceed with the rest of the build process
   - This ensures that Yarn 3.6.4 is used for all dependency resolution

3. **Enhanced fix-nx-plugins.js Script**

   Enhanced the `fix-nx-plugins.js` script to:
   - Detect the Nx version from package.json
   - Try to install @nx/js using `nx add @nx/js` first (which automatically aligns versions)
   - Fall back to direct npm installation if needed
   - This ensures the plugin is available at the correct version

4. **Aligned Node.js Versions**

   Updated Node.js version specifications in all package.json files to consistently use "20.x":
   - Root package.json already had "node": "20.x"
   - Updated packages/twenty-server/package.json from "^18.17.1" to "20.x"
   - Updated packages/twenty-emails/package.json from "^18.17.1" to "20.x"
   - Updated packages/twenty-shared/package.json from "^18.17.1" to "20.x"
   - Updated packages/twenty-front/package.json from "22.x" to "20.x"
   - This ensures consistency with Vercel's Node.js runtime and prevents cache invalidation

5. **Updated Yarn Version References**

   Updated all references to Yarn version in package.json files to use "^3.6.4" instead of "^4.0.2" to maintain consistency.

## How This Fixes the Issue

1. **Yarn Version Downgrade**

   Downgrading to Yarn 3.6.4 sidesteps the known bug in Yarn 4.x that causes the "No candidates found" error. This is a recommended workaround in the Yarn community.

2. **Lockfile Regeneration**

   Running `yarn install` with Yarn 3.6.4 regenerates the lockfile with the correct dependency resolutions, addressing the "This package doesn't seem to be present in your lockfile" error.

3. **Nx Plugin Alignment**

   Using `nx add @nx/js` ensures that the plugin version matches the Nx core version, preventing version mismatches.

4. **Node.js Version Consistency**

   By aligning all Node.js version specifications to "20.x", we ensure that Vercel uses the same Node.js version for all parts of the build process, preventing cache invalidation and version-related issues.

## Verifying the Fix

After deploying these changes to Vercel, the build process should complete successfully without the Yarn resolution and lockfile errors. You can verify this by checking the build logs in the Vercel dashboard.
