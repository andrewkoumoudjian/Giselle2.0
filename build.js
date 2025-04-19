#!/usr/bin/env node
/**
 * This script handles the build process for Vercel deployment
 * It runs the prepare-vercel script and then builds the required packages in order
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const ROOT_DIR = path.resolve(__dirname);
const PREPARE_VERCEL_SCRIPT = path.join(ROOT_DIR, 'scripts', 'prepare-vercel-deployment.js');

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
async function buildForVercel() {
  try {
    console.log('Starting Vercel build process...');
    
    // Step 1: Run the prepare-vercel script
    console.log('\n== Running prepare-vercel script ==');
    runCommand('node scripts/prepare-vercel-deployment.js');
    
    // Step 2: Build shared package
    console.log('\n== Building twenty-shared ==');
    runCommand('yarn workspace twenty-shared build');
    
    // Step 3: Build UI package
    console.log('\n== Building twenty-ui ==');
    runCommand('yarn workspace twenty-ui build');
    
    // Step 4: Build front package
    console.log('\n== Building twenty-front ==');
    runCommand('yarn workspace twenty-front build');
    
    console.log('\nBuild completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run build
buildForVercel(); 