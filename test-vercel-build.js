#!/usr/bin/env node

/**
 * This script tests if the Vercel build environment is set up correctly.
 * It checks for the presence of required files and their versions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Testing Vercel build environment...');

// Check yarn version
try {
  console.log('\nChecking Yarn version:');
  const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
  console.log(`Yarn version: ${yarnVersion}`);
  
  if (yarnVersion.startsWith('4.4.')) {
    console.log('✅ Yarn version is correct (4.4.x)');
  } else {
    console.log('⚠️ Yarn version is not 4.4.x. This may cause issues during build.');
  }
} catch (error) {
  console.error('❌ Error checking Yarn version:', error.message);
}

// Check for yarn release file
try {
  console.log('\nChecking for yarn release file:');
  const yarnReleasePath = path.join(process.cwd(), '.yarn/releases/yarn-4.4.0.cjs');
  
  if (fs.existsSync(yarnReleasePath)) {
    const stats = fs.statSync(yarnReleasePath);
    console.log(`✅ Found yarn-4.4.0.cjs (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.error('❌ yarn-4.4.0.cjs not found in .yarn/releases/');
  }
} catch (error) {
  console.error('❌ Error checking for yarn release file:', error.message);
}

// Check yarnrc.yml configuration
try {
  console.log('\nChecking .yarnrc.yml configuration:');
  const yarnrcPath = path.join(process.cwd(), '.yarnrc.yml');
  
  if (fs.existsSync(yarnrcPath)) {
    const yarnrcContent = fs.readFileSync(yarnrcPath, 'utf8');
    console.log(`Found .yarnrc.yml with content:\n${yarnrcContent.slice(0, 200)}...`);
    
    if (yarnrcContent.includes('yarn-4.4.0.cjs')) {
      console.log('✅ .yarnrc.yml references correct Yarn version');
    } else {
      console.error('❌ .yarnrc.yml does not reference yarn-4.4.0.cjs');
    }
  } else {
    console.error('❌ .yarnrc.yml not found');
  }
} catch (error) {
  console.error('❌ Error checking .yarnrc.yml:', error.message);
}

// Check package.json configuration
try {
  console.log('\nChecking package.json configuration:');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.packageManager === 'yarn@4.4.0') {
      console.log('✅ package.json has correct packageManager: yarn@4.4.0');
    } else {
      console.error(`❌ package.json has incorrect packageManager: ${packageJson.packageManager}`);
    }
    
    console.log(`build:all script: ${packageJson.scripts?.['build:all'] || 'Not found'}`);
  } else {
    console.error('❌ package.json not found');
  }
} catch (error) {
  console.error('❌ Error checking package.json:', error.message);
}

// Overall summary
console.log('\n📋 Overall verification summary:');
console.log('To fix Vercel build issues, ensure:');
console.log('1. .yarn/releases/yarn-4.4.0.cjs is present and ~2.5MB in size');
console.log('2. .yarnrc.yml points to .yarn/releases/yarn-4.4.0.cjs');
console.log('3. package.json has "packageManager": "yarn@4.4.0"');
console.log('4. The build:all script doesn\'t try to run setup-yarn-3.6.4.js');

console.log('\n🚀 To test the build locally, run:');
console.log('yarn build:all'); 