# Fixing Yarn 4.4.0 + NX Plugin Lockfile Issues on Vercel

This document explains the strategy we implemented to fix the Yarn 4.4.0 lockfile resolution issues with NX packages and monorepo workspaces on Vercel deployment.

## The Problem

When deploying to Vercel with Yarn 4.4.0, we encountered the following errors:

```
➤ YN0082: │ @nx/js@npm:22.10.2: No candidates found
➤ YN0000: └ Completed in 1s 352ms
Internal Error: @nx/js@npm:22.10.2: This package doesn't seem to be present in your lockfile
```

And with workspace packages in a monorepo:

```
Internal Error: twenty@workspace:.: This package doesn't seem to be present in your lockfile; run "yarn install" to update the lockfile
```

These errors occur because:

1. Yarn 4.4.0 is more strict about lockfile integrity than earlier versions
2. Vercel runs in immutable mode by default, preventing lockfile updates
3. NX packages have complex interdependencies that can be challenging to resolve
4. Temporary directory limitations on Vercel can prevent certain workarounds
5. Yarn workspace packages require special handling in Vercel's deployment environment
6. Monorepo structures with internal package references don't work out-of-the-box on Vercel

## Our Solution

We implemented a multi-stage approach to fix these issues:

### 1. Custom Pre-Build Script (`vercel-prebuild.js`)

This script runs before the build process and:
- Disables immutable installs (`enableImmutableInstalls: false`)
- Detects and configures workspace settings when needed
- Fixes workspace:* references with concrete versions (0.0.0)
- Runs a specialized lockfile fix script
- Handles lockfile regeneration when necessary
- Provides fallback build methods if dependencies fail

### 2. Lockfile Fix Script (`vercel-lockfile-fix.js`)

This script:
- Creates a temporary project with only the NX dependencies
- Generates a clean lockfile for these dependencies
- Replaces the main lockfile with this clean version
- Installs NX packages individually as dependencies

### 3. Monorepo Workspace Resolution Fix

For monorepo workspace packages, the script:
- Creates a proper `.yarnrc.yml` configuration file with necessary settings
- Enables workspace features in Yarn
- Sets the proper node module mode for Vercel
- Replaces workspace protocol references with fixed versions
- Ensures NX core package is directly available
- Forcefully regenerates the lockfile if workspace resolution fails

### 4. Updated Vercel Configuration (`vercel.json`)

We configured Vercel to:
- Use our custom pre-build script for installing dependencies
- Provide a fallback build command if the main build fails
- Maintain the same server configuration (API functions, memory, etc.)

## Key Files

- `vercel-prebuild.js`: Main dependency preparation script
- `vercel-lockfile-fix.js`: Specialized script for fixing NX package resolution
- `vercel.json`: Updated Vercel configuration

## How It Works

1. **Vercel starts the build** and runs our `installCommand`
2. **Pre-build script** configures Yarn and detects monorepo workspace structure
3. **Workspace configuration** is applied for monorepo projects
   - Converts workspace:* references to fixed versions
   - Creates proper .yarnrc.yml configuration
   - Ensures NX is available as direct dependency
4. **Lockfile fix** creates a temporary project to properly resolve NX packages
5. **Lockfile regeneration** occurs if initial installation fails
6. **Main project** adopts the clean lockfile and installs dependencies
7. **Build process** runs with properly resolved dependencies

## Troubleshooting

If deployment still fails:

1. Check Vercel logs for specific error messages
2. For workspace errors, try adding a `.yarnrc.yml` file to your repository with:
   ```yml
   nodeLinker: node-modules
   npmRegistryServer: "https://registry.npmjs.org/"
   enableWorkspaces: true
   nmMode: hardlinks-local
   compressionLevel: 0
   
   packageExtensions:
     @nx/js@*:
       dependencies:
         nx: "22.10.2"
   ```
3. For monorepo workspace issues, consider temporarily replacing workspace:* references in package.json with fixed versions for deployment
4. Verify that all required NX packages are listed in our fix script
5. For persistent workspace issues, try setting `packageManager: yarn@3.6.4` in `package.json` to use an older, more stable Yarn version
6. Try manually updating lockfile locally and pushing to the repository

## References

- [Yarn Immutable Installs Documentation](https://yarnpkg.com/configuration/yarnrc#enableImmutableInstalls)
- [Yarn Workspace Protocol](https://yarnpkg.com/features/workspaces)
- [NX Troubleshooting Guide](https://nx.dev/troubleshooting/troubleshoot-nx-install-issues)
- [Vercel Build Errors Community Discussion](https://community.redwoodjs.com/t/yarn-install-error-while-deploying-to-vercel/5910)
- [Yarn Workspaces in Nx](https://nx.dev/recipes/monorepo/yarn-workspaces)
- [GitHub Issue: NX Build Fails on Ubuntu](https://github.com/nrwl/nx/issues/10696) 