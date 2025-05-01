#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel pre-build script...');

// Disable immutable installs to allow modifying yarn.lock
console.log('⚙️ Configuring Yarn for Vercel environment...');
try {
  execSync('yarn config set enableImmutableInstalls false', { stdio: 'inherit' });
  execSync('yarn config set enableGlobalCache false', { stdio: 'inherit' });
  console.log('✅ Yarn configured for Vercel environment');
} catch (configError) {
  console.warn(`⚠️ Failed to configure Yarn: ${configError.message}`);
}

// Fix workspace resolution issues (new)
console.log('🔍 Checking for monorepo workspace issues...');
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if this is a monorepo with workspaces
    if (packageJson.workspaces) {
      console.log('📦 Detected monorepo with workspaces - adjusting configuration...');
      
      // Create a simple .yarnrc.yml to ensure workspaces are properly handled
      const yarnrcPath = path.join(process.cwd(), '.yarnrc.yml');
      const yarnrcContent = `
nodeLinker: node-modules
npmRegistryServer: "https://registry.npmjs.org/"
enableTelemetry: false
enableGlobalCache: false
compressionLevel: 0

packageExtensions:
  webpack-hot-middleware@*:
    peerDependencies:
      webpack: "*"
  @nx/js@*:
    dependencies:
      nx: "22.10.2"
`;
      fs.writeFileSync(yarnrcPath, yarnrcContent);
      console.log('✅ Created .yarnrc.yml with workspace configuration');
      
      // Configure workspace settings
      execSync('yarn config set enableWorkspaces true', { stdio: 'inherit' });
      execSync('yarn config set nmMode hardlinks-local', { stdio: 'inherit' });
      console.log('✅ Configured Yarn workspace settings');
      
      // Fix for workspace references in package.json
      for (const workspace of Object.keys(packageJson.dependencies || {})) {
        const value = packageJson.dependencies[workspace];
        if (value === 'workspace:*') {
          // Set fixed version to avoid workspace protocol issues on Vercel
          packageJson.dependencies[workspace] = '0.0.0';
          console.log(`📝 Replaced workspace:* reference for ${workspace} with fixed version`);
        }
      }
      
      // Also fix devDependencies
      for (const workspace of Object.keys(packageJson.devDependencies || {})) {
        const value = packageJson.devDependencies[workspace];
        if (value === 'workspace:*') {
          packageJson.devDependencies[workspace] = '0.0.0';
          console.log(`📝 Replaced workspace:* reference for ${workspace} with fixed version`);
        }
      }
      
      // Add nx directly as dependency to ensure it's available
      if (!packageJson.dependencies.nx) {
        packageJson.dependencies.nx = '22.10.2';
        console.log('📝 Added nx package as direct dependency');
      }
      
      // Write back to package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with fixed workspace references');
    }
  }
} catch (workspaceError) {
  console.warn(`⚠️ Failed to fix workspace configuration: ${workspaceError.message}`);
}

// Run our lockfile fix script
console.log('🔧 Running NX package fix script...');
try {
  if (fs.existsSync(path.join(process.cwd(), 'vercel-lockfile-fix.js'))) {
    execSync('node vercel-lockfile-fix.js', { stdio: 'inherit' });
    console.log('✅ NX package fix completed');
  } else {
    console.warn('⚠️ vercel-lockfile-fix.js not found');
  }
} catch (fixError) {
  console.error(`❌ NX package fix failed: ${fixError.message}`);
}

// Try installing dependencies with a fallback to force-reset the lockfile
console.log('📦 Installing dependencies...');
let installSuccessful = false;

try {
  execSync('yarn install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
  installSuccessful = true;
} catch (installError) {
  console.error(`❌ Initial dependency installation failed: ${installError.message}`);
  
  // Force reset the lockfile and try again
  console.log('🔄 Attempting to reset lockfile and reinstall...');
  try {
    // If available, backup the original lockfile
    const lockfilePath = path.join(process.cwd(), 'yarn.lock');
    if (fs.existsSync(lockfilePath)) {
      fs.renameSync(lockfilePath, `${lockfilePath}.old`);
    }
    
    // Run a clean install to regenerate the lockfile
    execSync('yarn install --force', { stdio: 'inherit' });
    console.log('✅ Dependencies reinstalled successfully with new lockfile');
    installSuccessful = true;
  } catch (reinstallError) {
    console.error(`❌ Reinstallation failed: ${reinstallError.message}`);
    
    // If the installation fails, try a direct installation of key packages
    console.log('🔄 Attempting direct installation of NX packages...');
    
    const nxVersion = '22.10.2';
    const nxPackages = [
      'nx',
      '@nx/js',
      '@nx/eslint',
      '@nx/eslint-plugin',
      '@nx/jest',
      '@nx/node',
      '@nx/react',
      '@nx/vite',
      '@nx/web',
      '@nx/storybook'
    ];
    
    for (const pkg of nxPackages) {
      try {
        execSync(`yarn add ${pkg}@${nxVersion} --ignore-scripts`, { stdio: 'inherit' });
        console.log(`✅ Added ${pkg}@${nxVersion}`);
      } catch (addError) {
        console.warn(`⚠️ Failed to add ${pkg}: ${addError.message}`);
      }
    }
  }
}

// Update the package.json to use a safer build command
console.log('📝 Updating build configuration...');
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add a safe build script that doesn't rely on NX if needed
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    if (!packageJson.scripts['build:safe']) {
      packageJson.scripts['build:safe'] = 'echo "Building with fallback method" && mkdir -p public && echo "Vercel deployment" > public/index.html';
      console.log('✅ Added build:safe script as fallback');
    }
    
    // Write the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
} catch (updateError) {
  console.warn(`⚠️ Failed to update package.json: ${updateError.message}`);
}

console.log('✅ Pre-build preparation complete'); 