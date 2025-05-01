#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛠️ Starting yarn.lock direct modification for Nx packages...');

// Define the Nx version we need
const NX_VERSION = '22.10.2';

// List of packages that need to be added to yarn.lock
const NX_PACKAGES = [
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

// ========= IMPORTANT =========
// Instead of directly modifying the lockfile (which is error-prone),
// we'll create a fresh package.json with just the packages we need
// and use that to regenerate a proper lockfile

// Create a temp directory
const tempDir = path.join(process.cwd(), 'temp-nx-fix');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

try {
  // Create a minimal package.json
  const tempPackageJson = {
    name: "nx-temp-fix",
    version: "1.0.0",
    private: true,
    packageManager: "yarn@4.4.0",
    dependencies: {}
  };
  
  // Add only the packages we need
  for (const pkg of NX_PACKAGES) {
    tempPackageJson.dependencies[pkg] = NX_VERSION;
  }
  
  // Write the package.json
  fs.writeFileSync(
    path.join(tempDir, 'package.json'), 
    JSON.stringify(tempPackageJson, null, 2)
  );
  
  // Create an empty yarn.lock to start fresh
  fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
  
  // Create a basic .yarnrc.yml to match the project configuration
  fs.writeFileSync(path.join(tempDir, '.yarnrc.yml'), `
nodeLinker: node-modules
enableGlobalCache: false
`);
  
  console.log('📦 Created temporary project for NX package resolution');
  
  // Run yarn install in the temp directory to generate a clean lockfile
  console.log('🔄 Running yarn install in temporary project...');
  try {
    execSync('yarn install', { cwd: tempDir, stdio: 'inherit' });
    console.log('✅ Generated clean lockfile for NX packages');
    
    // Check if the lockfile was created successfully
    const tempLockfilePath = path.join(tempDir, 'yarn.lock');
    if (fs.existsSync(tempLockfilePath)) {
      // Create or update package.json resolutions in the main project
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.resolutions) {
          packageJson.resolutions = {};
        }
        
        let resolutionsUpdated = false;
        for (const pkg of NX_PACKAGES) {
          if (!packageJson.resolutions[pkg]) {
            packageJson.resolutions[pkg] = NX_VERSION;
            resolutionsUpdated = true;
          }
        }
        
        if (resolutionsUpdated) {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log('✅ Updated package.json resolutions');
        }
      }
      
      // Copy the temp node_modules to the project for the required packages
      console.log('📋 Copying resolved NX packages to project...');
      
      // Copy the yarn.lock entries for nx packages
      // First read both lockfiles
      const mainLockfilePath = path.join(process.cwd(), 'yarn.lock');
      if (fs.existsSync(mainLockfilePath)) {
        // Backup the original lockfile
        const lockfileBackupPath = path.join(process.cwd(), 'yarn.lock.backup');
        fs.copyFileSync(mainLockfilePath, lockfileBackupPath);
        console.log('✅ Created backup of original yarn.lock');
        
        // Replace the main yarn.lock with the one we just created
        fs.copyFileSync(tempLockfilePath, mainLockfilePath);
        console.log('✅ Replaced yarn.lock with clean version');
      } else {
        // If no lockfile exists, just copy the new one
        fs.copyFileSync(tempLockfilePath, mainLockfilePath);
        console.log('✅ Created new yarn.lock with resolved NX packages');
      }
      
      // Now try to install individual packages in the main project
      console.log('🔄 Installing resolved NX packages in main project...');
      for (const pkg of NX_PACKAGES) {
        try {
          execSync(`yarn add ${pkg}@${NX_VERSION} -D`, { stdio: 'inherit' });
          console.log(`✅ Installed ${pkg}@${NX_VERSION}`);
        } catch (error) {
          console.warn(`⚠️ Failed to install ${pkg}: ${error.message}`);
        }
      }
    } else {
      console.error('❌ Failed to generate lockfile in temporary project');
    }
  } catch (installError) {
    console.error(`❌ Failed to run yarn install in temporary project: ${installError.message}`);
  }
  
  // Clean up
  console.log('🧹 Cleaning up...');
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✅ Removed temporary files');
  } catch (cleanupError) {
    console.warn(`⚠️ Failed to clean up: ${cleanupError.message}`);
  }
  
  console.log('🚀 NX package fix script complete');
} catch (error) {
  console.error('❌ Error in NX package fix script:', error);
  process.exit(1);
} 