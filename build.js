#!/usr/bin/env node
/**
 * This script handles the build process for Vercel deployment
 * It runs the prepare-vercel script and then builds the required packages in order
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname);
const PREPARE_VERCEL_SCRIPT = path.join(ROOT_DIR, 'scripts', 'prepare-vercel-deployment.js');

// Clean up before build to free memory
function cleanupBefore() {
  try {
    console.log('\n== Cleaning up before build ==');
    // Remove node_modules/.cache
    const cacheDir = path.join(ROOT_DIR, 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      execSync(`rm -rf ${cacheDir}`);
      console.log('Removed node_modules/.cache');
    }
    
    // Remove node_modules/.vite
    const viteDir = path.join(ROOT_DIR, 'node_modules', '.vite');
    if (fs.existsSync(viteDir)) {
      execSync(`rm -rf ${viteDir}`);
      console.log('Removed node_modules/.vite');
    }
    
    // Run garbage collection if possible
    if (global.gc) {
      console.log('Running garbage collection');
      global.gc();
    }
  } catch (error) {
    console.warn('Warning during cleanup:', error.message);
  }
}

// Function to run a command and log output
function runCommand(command, cwd = ROOT_DIR) {
  console.log(`Running: ${command}`);
  
  // Set NODE_OPTIONS environment variable if not already set
  if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('--max-old-space-size=')) {
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS 
      ? `${process.env.NODE_OPTIONS} --max-old-space-size=8192`
      : '--max-old-space-size=8192';
    console.log(`Set NODE_OPTIONS to: ${process.env.NODE_OPTIONS}`);
  }
  
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_OPTIONS: process.env.NODE_OPTIONS,
        VITE_DISABLE_TYPESCRIPT_CHECKER: 'true',
        VITE_DISABLE_ESLINT_CHECKER: 'true'
      }
    });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    return false;
  }
}

// Function to ensure assets are properly copied
function copyAssets() {
  console.log('Copying assets for build...');
  
  // Copy UI assets to front-end public directory
  const uiAssetsDir = path.join(ROOT_DIR, 'packages', 'twenty-ui', 'src', 'assets');
  const frontPublicDir = path.join(ROOT_DIR, 'packages', 'twenty-front', 'public', 'assets');
  
  if (fs.existsSync(uiAssetsDir)) {
    console.log(`Copying UI assets from ${uiAssetsDir} to ${frontPublicDir}`);
    
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(frontPublicDir)) {
      fs.mkdirSync(frontPublicDir, { recursive: true });
    }
    
    // Copy icons directory
    const uiIconsDir = path.join(uiAssetsDir, 'icons');
    const frontIconsDir = path.join(frontPublicDir, 'icons');
    
    if (fs.existsSync(uiIconsDir)) {
      if (!fs.existsSync(frontIconsDir)) {
        fs.mkdirSync(frontIconsDir, { recursive: true });
      }
      
      const icons = fs.readdirSync(uiIconsDir).filter(file => file.endsWith('.svg'));
      console.log(`Found ${icons.length} icons to copy`);
      
      icons.forEach(icon => {
        const srcPath = path.join(uiIconsDir, icon);
        const destPath = path.join(frontIconsDir, icon);
        fs.copyFileSync(srcPath, destPath);
      });
      
      console.log(`Successfully copied ${icons.length} icons`);
    } else {
      console.log('No icons directory found, skipping icon copy');
    }
  } else {
    console.log('UI assets directory not found, skipping asset copy');
  }
}

// Check if all required environment variables for Vercel deployment are set
function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'VERCEL',
    'VERCEL_ENV'
  ];
  
  const optionalEnvVars = [
    'DB_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  console.log('\n== Checking environment variables ==');
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('This might be expected if not running in a Vercel environment');
  } else {
    console.log('All required environment variables are set');
  }
  
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.warn(`Optional environment variable ${varName} is not set`);
    }
  });
}

// Main build function
async function buildForVercel() {
  console.log('Starting Vercel build process...');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Current directory: ${ROOT_DIR}`);
  
  try {
    // Run cleanup first
    cleanupBefore();
    
    // Check environment
    checkEnvironmentVariables();
    
    // Step 1: Run the prepare-vercel script
    console.log('\n== Running prepare-vercel script ==');
    if (!runCommand('node scripts/prepare-vercel-deployment.js')) {
      throw new Error('Failed to run prepare-vercel script');
    }
    
    // Step 2: Prepare assets
    console.log('\n== Preparing assets ==');
    copyAssets();
    
    // Step 3: Build shared package
    console.log('\n== Building twenty-shared ==');
    if (!runCommand('yarn workspace twenty-shared build')) {
      throw new Error('Failed to build twenty-shared package');
    }
    
    // Free up memory after each step if possible
    if (global.gc) global.gc();
    
    // Step 4: Build UI package
    console.log('\n== Building twenty-ui ==');
    if (!runCommand('yarn workspace twenty-ui build')) {
      throw new Error('Failed to build twenty-ui package');
    }
    
    // Free up memory after each step if possible
    if (global.gc) global.gc();
    
    // Step 5: Build front package
    console.log('\n== Building twenty-front ==');
    if (!runCommand('yarn workspace twenty-front build')) {
      throw new Error('Failed to build twenty-front package');
    }
    
    console.log('\nBuild completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Run build
buildForVercel(); 