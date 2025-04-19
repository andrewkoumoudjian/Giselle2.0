#!/usr/bin/env node
/**
 * This is a simplified build script for testing the build process
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Define paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname);

// Function to run a command and log output
function runCommand(command, cwd = ROOT_DIR) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4500' }
    });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main build function
async function testBuild() {
  try {
    console.log('Starting test build process...');
    
    // Step 1: Build shared package
    console.log('\n== Building twenty-shared ==');
    runCommand('yarn workspace twenty-shared build');
    
    // Step 2: Build UI package
    console.log('\n== Building twenty-ui ==');
    runCommand('yarn workspace twenty-ui build');
    
    console.log('\nTest build completed successfully!');
  } catch (error) {
    console.error('Test build failed:', error);
    process.exit(1);
  }
}

// Run test build
testBuild(); 