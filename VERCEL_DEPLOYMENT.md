# Deploying Twenty on Vercel

This guide provides step-by-step instructions for successfully deploying Twenty on Vercel.

## Prerequisites

- A Vercel account
- A GitHub account with the Twenty codebase
- Node.js 20.x installed locally (for testing)
- Yarn 4.x installed locally (for testing)

## Fixed Issues for Vercel Deployment

### 1. assertUnreachable Export Fix

The `assertUnreachable` function in the twenty-shared package is now correctly exported as both a named export and a default export:

```typescript
// packages/twenty-shared/src/utils/assertUnreachable.ts
export const assertUnreachable = (
  value: never,
  errorMessage = 'Unreachable case statement',
): never => {
  throw new Error(errorMessage);
};

export default assertUnreachable;
```

### 2. Yarn Configuration

The project uses Yarn's node-modules linker instead of Plug'n'Play for better compatibility:

```yaml
# .yarnrc.yml
nodeLinker: "node-modules"
```

### 3. Vercel Build Optimization

A proper vercel.json file is included with configuration for serverless functions:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "yarn build:all",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*.js"
    }
  ],
  "cleanUrls": true,
  "regions": [
    "iad1"
  ]
}
```

### 4. Dependency Resolution

Dependency conflicts are resolved via the resolutions field in package.json:

```json
"resolutions": {
  "graphql": "16.8.0",
  "type-fest": "4.10.1",
  "typescript": "5.3.3",
  "prosemirror-model": "1.23.0",
  "yjs": "13.6.18",
  "graphql-redis-subscriptions/ioredis": "^5.6.0",
  "@nestjs/common": "10.4.17",
  "@nestjs/core": "10.4.17",
  "reflect-metadata": "^0.2.2",
  "typeorm": "^0.3.17",
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0"
}
```

## Deployment Setup

### 1. Initial Vercel Setup

1. Create a new project in Vercel
2. Select your GitHub repository containing the Twenty codebase
3. Configure the following build settings:
   - Build Command: `yarn build:all`
   - Output Directory: `packages/twenty-front/dist`
   - Install Command: `yarn install`
   - Node.js Version: 20.x

### 2. Environment Variables

Set up the following environment variables in Vercel:

```
# Database Connection
PG_DATABASE_URL=postgres://user:password@host:5432/dbname

# Authentication
ENCRYPTION_SECRET=your-encryption-secret
ACCESS_TOKEN_SECRET=your-access-token-secret
LOGIN_TOKEN_SECRET=your-login-token-secret

# Frontend Configuration
FRONTEND_URL=https://your-frontend-url.com

# Cache Storage
REDIS_URL=redis://username:password@host:port

# Nx Cache (optional but recommended)
NX_VERCEL_REMOTE_CACHE_TOKEN=your-nx-cache-token
NX_VERCEL_REMOTE_CACHE_TEAM=your-vercel-team-id
```

### 3. Remote Caching (Optional but Recommended)

To enable remote caching for faster builds:

1. Install the Vercel Nx plugin if not already installed:
   ```
   yarn add -D @vercel/remote-nx
   ```

2. Update nx.json with the remote cache configuration:
   ```json
   "tasksRunnerOptions": {
     "default": {
       "runner": "@vercel/remote-nx",
       "options": {
         "cacheableOperations": [
           "build",
           "test",
           "lint",
           "storybook:build"
         ],
         "cacheDirectory": "/tmp/nx-cache",
         "accessToken": "${NX_VERCEL_REMOTE_CACHE_TOKEN}",
         "teamId": "${NX_VERCEL_REMOTE_CACHE_TEAM}"
       }
     }
   }
   ```

3. Set up required environment variables in Vercel:
   - NX_VERCEL_REMOTE_CACHE_TOKEN: Your Vercel access token
   - NX_VERCEL_REMOTE_CACHE_TEAM: Your Vercel team ID (if applicable)

4. Create a `.vercel/plugins.json` file in your repository:
   ```json
   [
     {
       "name": "@vercel/remote-nx"
     }
   ]
   ```

## Troubleshooting

### Common Issues and Solutions

#### Missing exports in assertUnreachable.ts

If you see errors related to assertUnreachable not being exported:
1. Ensure both named and default exports exist in the file
2. Check that index.ts correctly re-exports the function

#### Nx Cache Errors

If you see "Cannot read properties of undefined (reading 'cacheError')":
1. Try resetting the cache: `npx nx reset`
2. Ensure environment variables for remote caching are set
3. Temporarily revert to the default runner if needed

#### SWC/Vite Plugin Errors

If you see errors with the SWC React plugin or @wyw-in-js/vite:
1. Check that all necessary peer dependencies are installed
2. Ensure the plugin configuration in vite.config.ts is correct
3. Update the resolutions field in package.json to fix conflicts

#### Vite Path Aliases

If you encounter TypeScript errors related to module resolution (TS2307: Cannot find module '@ui/...'), ensure path aliases are correctly configured:

1. Verify the root tsconfig.base.json has the proper path mappings:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@ui/*": ["packages/twenty-ui/src/*"],
         "@/*": ["packages/twenty-front/src/*"],
         "@server/*": ["packages/twenty-server/src/*"],
         "@shared/*": ["packages/twenty-shared/src/*"]
       }
     }
   }
   ```

2. Each package's tsconfig.json should extend the base config:
   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "rootDir": "src",
       "outDir": "dist"
       // other package-specific options...
     }
   }
   ```

3. In Vite configs, ensure tsconfigPaths plugin is properly configured:
   ```javascript
   import tsconfigPaths from 'vite-tsconfig-paths';
   
   export default defineConfig({
     plugins: [
       react(),
       tsconfigPaths(), // reads paths from tsconfig
     ],
     resolve: {
       alias: {
         '@ui': resolve(__dirname, '../twenty-ui/src')
       }
     }
   });
   ```

This ensures both TypeScript and Vite correctly resolve module paths.

#### TypeScript rootDir/outDir Overlap Issues

If you see errors like `TS5055: Cannot write file 'index.js' because it would overwrite input file`:

1. Fix your tsconfig.json to properly separate source and output directories:
   ```json
   {
     "compilerOptions": {
       "rootDir": "src",
       "outDir": "dist",
       // other options...
     },
     "include": ["src/**/*"],
     "exclude": ["dist", "node_modules"]
   }
   ```

2. Ensure build scripts reference the correct output directory

#### Circular Dependencies

If you encounter build errors like "Could not execute command because the task graph has a circular dependency", check for circular dependencies between your packages:

1. Identify the circular path in your dependency graph:
   ```
   twenty-chrome-extension:build → twenty-shared:build → twenty-front:build → twenty-ui:build → twenty-shared:build
   ```

2. Break the circular dependency by modifying the `dependsOn` in affected project.json files:
   - Remove `^build` from dependsOn where it creates circular paths
   - Add explicit command executors instead of relying on implicit dependencies:
   
   ```json
   // packages/twenty-ui/project.json
   "build": {
     "executor": "nx:run-commands",
     "dependsOn": ["generateBarrels"],
     "options": {
       "command": "tsc -p tsconfig.json --declaration --declarationDir dist && vite build"
     }
   }
   ```

3. Ensure proper declaration file generation:
   - Add `--declaration` flag in TypeScript build commands
   - Specify output directories with `--declarationDir dist`
   
4. Visualize your dependency graph with:
   ```bash
   npx nx graph
   ```

## Monitoring Deployments

After deployment, monitor your application logs in the Vercel dashboard. You can also use tools like Sentry or LogRocket for more detailed monitoring and error tracking.

## Future Improvements

- Consider upgrading to Nx 21+ when released
- Implement proper error logging with Sentry
- Set up automatic database migrations on deploy
- Configure proper CI/CD with GitHub Actions