#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running Vercel build helper script...');

// Ensure correct NX version matches
const NX_VERSION = '22.10.2';

try {
  console.log(`📦 Setting up npm registry...`);
  execSync(`npm config set registry https://registry.npmjs.org/`, { stdio: 'inherit' });

  // Create the .npmrc file if it doesn't exist
  if (!fs.existsSync('.npmrc')) {
    fs.writeFileSync('.npmrc', 'registry=https://registry.npmjs.org/\nnetwork-timeout=600000\n');
  }

  // Clean Yarn's npm metadata cache to avoid "No candidates found" errors
  console.log(`🧹 Cleaning Yarn's npm metadata cache...`);
  try {
    const yarnGlobalFolder = execSync('yarn config get globalFolder', { encoding: 'utf8' }).trim();
    const npmMetadataPath = path.join(yarnGlobalFolder, 'metadata', 'npm');

    if (fs.existsSync(npmMetadataPath)) {
      console.log(`Found npm metadata at ${npmMetadataPath}, removing...`);
      fs.rmSync(npmMetadataPath, { recursive: true, force: true });
    } else {
      console.log(`No npm metadata found at ${npmMetadataPath}`);
    }
  } catch (e) {
    console.warn(`⚠️ Could not clean Yarn's npm metadata cache: ${e.message}`);
  }

  // Ensure all required Nx plugins are available at the correct version
  console.log(`📦 Ensuring Nx plugins are available at version ${NX_VERSION}...`);

  const requiredPlugins = [
    '@nx/js',
    '@nx/eslint',
    '@nx/eslint-plugin',
    '@nx/jest',
    '@nx/node',
    '@nx/react',
    '@nx/storybook',
    '@nx/vite',
    '@nx/web'
  ];

  for (const plugin of requiredPlugins) {
    console.log(`Checking ${plugin}@${NX_VERSION}...`);
    try {
      // Just check if the package exists at the right version
      execSync(`npm view ${plugin}@${NX_VERSION} version`, { stdio: 'pipe' });
      console.log(`✅ ${plugin}@${NX_VERSION} is available`);
    } catch (e) {
      console.warn(`⚠️ Could not verify ${plugin}@${NX_VERSION}: ${e.message}`);
    }
  }

  console.log('✅ Build helper completed successfully');
} catch (error) {
  console.error('❌ Error in build helper script:', error);
  process.exit(1);
}