# Fixing Yarn 4.4.0 + NX Plugin Lockfile Issues on Vercel

This document explains the strategy we implemented to fix the Yarn 4.4.0 lockfile resolution issues with NX packages on Vercel deployment.

## The Problem

When deploying to Vercel with Yarn 4.4.0, we encountered the following error:

```
➤ YN0082: │ @nx/js@npm:22.10.2: No candidates found
➤ YN0000: └ Completed in 1s 352ms
Internal Error: @nx/js@npm:22.10.2: This package doesn't seem to be present in your lockfile
```

This error occurs because:

1. Yarn 4.4.0 is more strict about lockfile integrity than earlier versions
2. Vercel runs in immutable mode by default, preventing lockfile updates
3. NX packages have complex interdependencies that can be challenging to resolve
4. Temporary directory limitations on Vercel can prevent certain workarounds

## Our Solution

We implemented a multi-stage approach to fix this issue:

### 1. Custom Pre-Build Script (`vercel-prebuild.js`)

This script runs before the build process and:
- Disables immutable installs (`enableImmutableInstalls: false`)
- Runs a specialized lockfile fix script
- Provides fallback build methods if dependencies fail

### 2. Lockfile Fix Script (`vercel-lockfile-fix.js`)

This script:
- Creates a temporary project with only the NX dependencies
- Generates a clean lockfile for these dependencies
- Replaces the main lockfile with this clean version
- Installs NX packages individually as dev dependencies

### 3. Updated Vercel Configuration (`vercel.json`)

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
2. **Pre-build script** configures Yarn and runs the lockfile fix
3. **Lockfile fix** creates a temporary project to properly resolve NX packages
4. **Temporary project** generates a clean lockfile with correct NX resolutions
5. **Main project** adopts the clean lockfile and installs dependencies
6. **Build process** runs with properly resolved dependencies

## Troubleshooting

If deployment still fails:

1. Check Vercel logs for specific error messages
2. Verify that all required NX packages are listed in our fix script
3. Try manually updating lockfile locally and pushing to the repository
4. Consider adding a specific problematic package to `package.json` dependencies

## References

- [Yarn Immutable Installs Documentation](https://yarnpkg.com/configuration/yarnrc#enableImmutableInstalls)
- [NX Troubleshooting Guide](https://nx.dev/troubleshooting/troubleshoot-nx-install-issues)
- [Vercel Build Errors Community Discussion](https://community.redwoodjs.com/t/yarn-install-error-while-deploying-to-vercel/5910) 