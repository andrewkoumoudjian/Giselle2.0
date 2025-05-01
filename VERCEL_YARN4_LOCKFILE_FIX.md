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

Also, we encountered YAML parsing errors:

```
YAMLException: bad indentation of a mapping entry at line 12, column 3:
      @nx/js@*:
      ^
```

These errors occur because:

1. Yarn 4.4.0 is more strict about lockfile integrity than earlier versions
2. Vercel runs in immutable mode by default, preventing lockfile updates
3. NX packages have complex interdependencies that can be challenging to resolve
4. Temporary directory limitations on Vercel can prevent certain workarounds
5. Yarn workspace packages require special handling in Vercel's deployment environment
6. Monorepo structures with internal package references don't work out-of-the-box on Vercel
7. YAML indentation and quoting rules are strictly enforced in Yarn 4.4.0

## Our Solution

We implemented a multi-stage approach to fix these issues:

### 1. Properly Formatted .yarnrc.yml File

Create a valid YAML configuration file with:
- Properly indented entries (2 spaces per level)
- Quoted keys that contain special characters like @ and *
- Explicit settings for workspaces and node modules

### 2. Simplified Vercel Configuration 

Update vercel.json to use a simplified approach:
- Use standard build command with fallbacks
- Avoid custom installation commands that might generate invalid YAML
- Maintain the same server configuration (API functions, memory, etc.)

### 3. Manual Package Resolution

For monorepo workspace packages:
- Replace workspace: protocol references with fixed versions
- Create an explicit packageExtensions section in .yarnrc.yml
- Ensure NX core package is directly available

## Key Fixes

1. **YAML Indentation and Quoting**: Ensure all YAML files use consistent 2-space indentation and properly quote keys with special characters like `@nx/js@*`.

2. **Direct File Creation**: Instead of using `yarn config set` which can generate improperly formatted YAML, directly create .yarnrc.yml with proper formatting.

3. **Workspace Protocol Handling**: Replace `workspace:*` references in package.json with fixed versions to ensure compatibility with Vercel's environment.

## Example .yarnrc.yml

```yaml
nodeLinker: node-modules
npmRegistryServer: "https://registry.npmjs.org/"
enableTelemetry: false
enableGlobalCache: false
enableImmutableInstalls: false
compressionLevel: 0

packageExtensions:
  "webpack-hot-middleware@*":
    peerDependencies:
      webpack: "*"
  "@nx/js@*":
    dependencies:
      nx: "22.10.2"
  "@nx/react@*":
    dependencies:
      "@nx/js": "22.10.2"
```

## Troubleshooting

If deployment still fails:

1. Check Vercel logs for specific YAML syntax errors
2. Ensure all keys with special characters in .yarnrc.yml are properly quoted (use double quotes)
3. Validate YAML formatting with consistent 2-space indentation
4. For monorepo workspace issues, consider replacing workspace:* references with fixed versions
5. Verify that all required NX packages are listed in the packageExtensions section
6. Consider using a YAML validator to check syntax before deployment

## References

- [Yarn Immutable Installs Documentation](https://yarnpkg.com/configuration/yarnrc#enableImmutableInstalls)
- [Yarn Workspace Protocol](https://yarnpkg.com/features/workspaces)
- [NX Troubleshooting Guide](https://nx.dev/troubleshooting/troubleshoot-nx-install-issues)
- [Vercel Build Errors Community Discussion](https://community.redwoodjs.com/t/yarn-install-error-while-deploying-to-vercel/5910)
- [Yarn Workspaces in Nx](https://nx.dev/recipes/monorepo/yarn-workspaces)
- [GitHub Issue: NX Build Fails on Ubuntu](https://github.com/nrwl/nx/issues/10696)
- [YAML Syntax Guide](https://stackoverflow.com/questions/30642317/how-to-automatically-re-indent-a-yaml-file) 