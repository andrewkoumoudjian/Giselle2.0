#!/usr/bin/env node
/**
 * This is a wrapper script to execute the root build.js file
 * Vercel is looking for this file at /vercel/path0/packages/twenty-front/build.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the root directory path (two levels up from this file)
const rootDir = path.resolve(__dirname, '..', '..');
const rootBuildScript = path.join(rootDir, 'build.js');

console.log('Running build script from:', __dirname);
console.log('Executing root build script at:', rootBuildScript);

// Clean up dist directory and node_modules/.vite cache before building
console.log('Cleaning up before build...');
try {
  if (fs.existsSync('./dist')) {
    execSync('rm -rf ./dist');
    console.log('Removed existing dist directory');
  }
  
  const cacheDir = '../../node_modules/.vite/packages/twenty-front';
  if (fs.existsSync(cacheDir)) {
    execSync(`rm -rf ${cacheDir}`);
    console.log('Removed vite cache directory');
  }
} catch (error) {
  console.warn('Warning: Cleanup failed, but continuing with build:', error.message);
}

// Set environment variables for build
process.env.VITE_DISABLE_TYPESCRIPT_CHECKER = 'true';
process.env.VITE_DISABLE_ESLINT_CHECKER = 'true';

// Setting NODE_OPTIONS if not already set
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('--max-old-space-size=')) {
  process.env.NODE_OPTIONS = '--max-old-space-size=8192';
  console.log(`Set NODE_OPTIONS to: ${process.env.NODE_OPTIONS}`);
}

console.log('Starting build with command: vite build');
execSync('vite build', { 
  stdio: 'inherit',
  env: { ...process.env }
});

console.log('Build completed, injecting runtime environment...');
execSync('sh ./scripts/inject-runtime-env.sh', { 
  stdio: 'inherit',
  env: { ...process.env }
});

console.log('Build process completed successfully!'); 