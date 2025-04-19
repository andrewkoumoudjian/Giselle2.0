#!/usr/bin/env node
/**
 * Wrapper script for Vercel build process
 * This ensures we're in the correct directory and handles environment variable setup
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Setup environment variables needed for build
function setupEnvironment() {
  console.log('Setting up environment variables...');
  
  // Map Postgres variables
  if (!process.env.DB_URL && process.env.POSTGRES_URL) {
    console.log('Setting DB_URL from POSTGRES_URL');
    process.env.DB_URL = process.env.POSTGRES_URL;
  } else if (!process.env.DB_URL && process.env.POSTGRES_PRISMA_URL) {
    console.log('Setting DB_URL from POSTGRES_PRISMA_URL');
    process.env.DB_URL = process.env.POSTGRES_PRISMA_URL;
  } else if (!process.env.DB_URL) {
    console.warn('WARNING: DB_URL not set and no alternative found');
  }

  // Map Supabase variables
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('Setting SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL');
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  if (!process.env.SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Setting SUPABASE_ANON_KEY from NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  // Ensure Redis variables are properly set
  if (!process.env.REDIS_URL && process.env.REDIS_HOST) {
    console.log('Constructing REDIS_URL from REDIS_HOST and REDIS_PASSWORD');
    const host = process.env.REDIS_HOST;
    const password = process.env.REDIS_PASSWORD || '';
    
    if (password) {
      process.env.REDIS_URL = `redis://:${password}@${host}:6379`;
    } else {
      process.env.REDIS_URL = `redis://${host}:6379`;
    }
  } else if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.warn('WARNING: Neither REDIS_URL nor REDIS_HOST is set');
  }

  // Always set serverless flag for Vercel
  process.env.IS_SERVERLESS = 'true';
  
  // Log environment variable status for debugging
  console.log('Environment variable setup completed');
  console.log('DB_URL is set:', !!process.env.DB_URL);
  console.log('SUPABASE_URL is set:', !!process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY is set:', !!process.env.SUPABASE_ANON_KEY);
  console.log('REDIS_URL is set:', !!process.env.REDIS_URL);
}

// Create necessary directory structure for twenty-ui
function createTwentyUiDirectories() {
  try {
    console.log('Creating twenty-ui module directories...');
    const twentyUiDir = path.join(process.cwd(), 'packages', 'twenty-ui');
    
    if (!fs.existsSync(twentyUiDir)) {
      console.log('Creating twenty-ui directory');
      fs.mkdirSync(twentyUiDir, { recursive: true });
    }
    
    // Define all UI module directories to create
    const uiModules = [
      'display',
      'components',
      'input',
      'navigation',
      'utilities',
      'theme',
      'layout',
      'feedback',
      'json-visualizer'
    ];
    
    uiModules.forEach(module => {
      const moduleDir = path.join(twentyUiDir, module);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(moduleDir)) {
        console.log(`Creating directory: ${moduleDir}`);
        fs.mkdirSync(moduleDir, { recursive: true });
      }
      
      // Create package.json for the module
      const packageJsonPath = path.join(moduleDir, 'package.json');
      const packageJson = {
        name: `@twenty-ui/${module}`,
        version: '0.1.0',
        main: `../src/${module}/index.ts`,
        types: `../src/${module}/index.ts`,
        sideEffects: false
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Created/verified: ${packageJsonPath}`);
    });
    
    console.log('All twenty-ui directories created successfully');
  } catch (error) {
    console.error('Error creating twenty-ui directories:', error);
    // Continue with the build even if this fails
  }
}

// Determine the root directory
const rootDir = process.cwd();
console.log('Current working directory:', rootDir);

// Log directory structure for debugging
console.log('Directory structure:');
try {
  const scriptDir = path.join(rootDir, 'scripts');
  console.log('Scripts directory exists:', fs.existsSync(scriptDir));
  if (fs.existsSync(scriptDir)) {
    console.log('Scripts directory contents:', fs.readdirSync(scriptDir));
  }
  
  const packagesDir = path.join(rootDir, 'packages');
  console.log('Packages directory exists:', fs.existsSync(packagesDir));
  if (fs.existsSync(packagesDir)) {
    console.log('Packages directory contents:', fs.readdirSync(packagesDir));
  }
} catch (error) {
  console.error('Error checking directory structure:', error);
}

// Setup environment variables
setupEnvironment();

// Ensure twenty-ui directories exist
createTwentyUiDirectories();

// Run existing scripts if they exist, but don't fail if they don't
try {
  console.log('Running environment compatibility script...');
  if (fs.existsSync(path.join(rootDir, 'scripts', 'vercel-env-compatibility.js'))) {
    require('./scripts/vercel-env-compatibility.js');
  } else {
    console.log('Environment compatibility script not found, skipping');
  }
} catch (error) {
  console.error('Error running environment compatibility script:', error);
  // Continue with the build even if this fails
}

try {
  console.log('Running prepare-vercel script...');
  if (fs.existsSync(path.join(rootDir, 'scripts', 'prepare-vercel-deployment.js'))) {
    require('./scripts/prepare-vercel-deployment.js');
  } else {
    console.log('Prepare-vercel script not found, skipping (already handled in this script)');
  }
} catch (error) {
  console.error('Error running prepare-vercel script:', error);
  // Continue with the build even if this fails
}

// Run build steps with error handling and retries
function runBuildStep(workspaceName, maxRetries = 2) {
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      console.log(`Building ${workspaceName} package (attempt ${attempts + 1})...`);
      execSync(`yarn workspace ${workspaceName} build`, { 
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
      });
      console.log(`Successfully built ${workspaceName}`);
      return true; // Success
    } catch (error) {
      attempts++;
      console.error(`Error building ${workspaceName} (attempt ${attempts}/${maxRetries + 1}):`, error.message);
      
      if (attempts <= maxRetries) {
        console.log(`Retrying ${workspaceName} build...`);
      } else {
        console.error(`Failed to build ${workspaceName} after ${maxRetries + 1} attempts`);
        return false; // Failed after all retries
      }
    }
  }
}

// Run all build steps
try {
  // Build in order of dependencies
  const buildSteps = [
    'twenty-shared',
    'twenty-ui',
    'twenty-front'
  ];
  
  let success = true;
  for (const step of buildSteps) {
    if (!runBuildStep(step)) {
      success = false;
      break;
    }
  }
  
  if (success) {
    console.log('Build completed successfully');
  } else {
    console.error('Build failed');
    process.exit(1);
  }
} catch (error) {
  console.error('Unexpected build error:', error);
  process.exit(1);
} 