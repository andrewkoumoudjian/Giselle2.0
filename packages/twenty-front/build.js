#!/usr/bin/env node
/**
 * This is a wrapper script to execute the root build.js file
 * Vercel is looking for this file at /vercel/path0/packages/twenty-front/build.js
 */

import { execSync } from 'child_process';
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

try {
  // Run the root build.js script
  execSync(`node ${rootBuildScript}`, {
    stdio: 'inherit',
    cwd: rootDir
  });
} catch (error) {
  console.error('Error executing build script:', error);
  process.exit(1);
} 