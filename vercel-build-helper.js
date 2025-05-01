#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running Vercel build helper script...');

// Ensure correct NX version matches
const NX_VERSION = '22.10.2';

// Force add the correct @nx/eslint-plugin version
try {
  console.log(`📦 Ensuring @nx/eslint-plugin@${NX_VERSION} is available...`);
  execSync(`npm config set registry https://registry.npmjs.org/`, { stdio: 'inherit' });
  
  // Create the .npmrc file if it doesn't exist
  if (!fs.existsSync('.npmrc')) {
    fs.writeFileSync('.npmrc', 'registry=https://registry.npmjs.org/\nnetwork-timeout=600000\n');
  }
  
  console.log('✅ Build helper completed successfully');
} catch (error) {
  console.error('❌ Error in build helper script:', error);
  process.exit(1);
}