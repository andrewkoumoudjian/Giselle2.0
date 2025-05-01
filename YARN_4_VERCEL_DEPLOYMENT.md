# Deploying with Yarn 4.4.0 on Vercel

This document explains the configuration and fixes implemented to successfully deploy this project on Vercel using Yarn 4.4.0.

## Configuration Summary

1. **Yarn 4.4.0 Setup**
   - Using `.yarnrc.yml` to specify Yarn version: `.yarn/releases/yarn-4.4.0.cjs`
   - Using Node 20.x as specified in package.json and `.nvmrc`
   - Enabled Corepack on Vercel with `ENABLE_EXPERIMENTAL_COREPACK=1`

2. **Vercel Configuration**
   - Updated `vercel.json` to use a pre-build step: `node vercel-prepare-yarn.js && yarn build:all`
   - Set appropriate memory (1024MB) and timeout (10s) limits for serverless functions

3. **NX Dependency Resolution**
   - Created custom scripts to ensure NX plugins are properly resolved in Yarn 4.4.0
   - Added specific fixes for `@nx/js` and other NX packages

## Common Issues and Fixes

### Missing NX Packages in Lockfile

**Issue**: Yarn 4.4.0 may fail with errors like:
```
YN0082: │ @nx/js@npm:22.10.2: No candidates found
Internal Error: @nx/js@npm:22.10.2: This package doesn't seem to be present in your lockfile
```

**Fix**: The `vercel-prepare-yarn.js` script addresses this by:
1. Synchronizing all NX package versions in package.json
2. Adding consistent resolutions in package.json
3. Using a fallback approach to generate clean lockfile entries if needed

### Corepack Not Enabled

**Issue**: Vercel might use Yarn 1.x instead of 4.4.0 if Corepack is not enabled.

**Fix**: 
1. Add `ENABLE_EXPERIMENTAL_COREPACK=1` environment variable in Vercel project settings
2. Ensure `.yarnrc.yml` correctly references the Yarn version

### Dependency Conflicts

**Issue**: Multiple versions of the same package in the dependency tree.

**Fix**:
1. Use resolutions in package.json to force specific versions
2. The `fix-nx-plugins.js` script ensures consistent NX plugin versions

## Deployment Steps

1. Ensure your local environment has run `node vercel-prepare-yarn.js` to update lockfiles
2. Commit all changes including the updated yarn.lock
3. In Vercel project settings:
   - Set `ENABLE_EXPERIMENTAL_COREPACK=1` as environment variable
   - Verify Node.js version is set to 20.x
   - Configure all other required environment variables as documented in VERCEL_ENVIRONMENT_VARIABLES.md

4. Deploy using the Vercel CLI or GitHub integration

## Troubleshooting

If you encounter deployment errors:

1. Check Vercel build logs for specific error messages
2. Verify that yarn.lock includes all NX packages with correct versions
3. Run `node vercel-prepare-yarn.js` locally and commit the updated lockfile
4. Check for version conflicts in package.json (dependencies vs devDependencies)

## References

- [Yarn Incompatibility with Wireit](https://github.com/google/wireit/issues/1156) - Known issues with Yarn 4.4.0
- [Vercel Documentation: Deploying Next.js](https://nextjs.org/learn/pages-router/deploying-nextjs-app-deploy) - Official deployment guide
- [Vercel Build Errors](https://vercel.community/t/vercel-build-error/6301) - Common build errors and solutions 