#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Downgrading Yarn to version 3.6.4...');

try {
  // Set Yarn version to 3.6.4
  console.log('Setting Yarn version to 3.6.4...');
  execSync('yarn set version 3.6.4', { stdio: 'inherit' });
  
  // Update packageManager field in package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.packageManager) {
    const oldPackageManager = packageJson.packageManager;
    packageJson.packageManager = 'yarn@3.6.4';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated packageManager from "${oldPackageManager}" to "yarn@3.6.4" in package.json`);
  }
  
  console.log('✅ Yarn downgraded successfully to version 3.6.4');
} catch (error) {
  console.error('❌ Error downgrading Yarn:', error);
  process.exit(1);
}
