#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing Yarn 4.4.0 for Vercel deployment...');

const requiredPackages = [
  '@nx/js',
  '@nx/eslint',
  '@nx/eslint-plugin',
  '@nx/jest',
  '@nx/node',
  '@nx/react',
  '@nx/vite',
  '@nx/web',
  '@nx/storybook'
];

// Get the nx version from package.json
let nxVersion = '22.10.2'; // Default
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies.nx) {
    nxVersion = packageJson.dependencies.nx;
  } else if (packageJson.devDependencies && packageJson.devDependencies.nx) {
    nxVersion = packageJson.devDependencies.nx;
  }
  console.log(`📊 Using Nx version: ${nxVersion}`);
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}

// Directly update the package.json to ensure consistent versions
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Make sure resolutions section exists
  if (!packageJson.resolutions) {
    packageJson.resolutions = {};
  }

  // Synchronize all NX packages to the same version
  let updated = false;
  for (const pkg of requiredPackages) {
    // Add to resolutions
    if (!packageJson.resolutions[pkg] || packageJson.resolutions[pkg] !== nxVersion) {
      packageJson.resolutions[pkg] = nxVersion;
      updated = true;
    }

    // Add to dependencies if it's there
    if (packageJson.dependencies && packageJson.dependencies[pkg]) {
      packageJson.dependencies[pkg] = nxVersion;
      updated = true;
    }

    // Add to devDependencies if it's there
    if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
      packageJson.devDependencies[pkg] = nxVersion;
      updated = true;
    }
  }

  if (updated) {
    console.log('✏️ Updating package.json with synchronized NX versions...');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  // ===== VERCEL DEPLOYMENT SPECIFIC FIXES =====
  
  // 1. Disable immutable installs for Yarn 4.4.0 on Vercel
  console.log('⚙️ Configuring Yarn settings for Vercel...');
  try {
    execSync('yarn config set enableImmutableInstalls false', { stdio: 'inherit' });
    execSync('yarn config set enableGlobalCache false', { stdio: 'inherit' });
    console.log('✅ Yarn configs set for Vercel environment');
  } catch (configError) {
    console.warn(`⚠️ Could not set Yarn configs: ${configError.message}`);
  }
  
  // 2. Directly modify yarn.lock to add missing Nx package entries
  console.log('🔧 Running direct lockfile fix for Nx packages...');
  try {
    // First check if our script exists
    if (fs.existsSync('./vercel-lockfile-fix.js')) {
      execSync('node vercel-lockfile-fix.js', { stdio: 'inherit' });
    } else {
      console.warn('⚠️ vercel-lockfile-fix.js script not found, skipping direct lockfile fixes');
    }
  } catch (lockfixError) {
    console.warn(`⚠️ Error running lockfile fix: ${lockfixError.message}`);
  }
  
  // 3. Run yarn install without immutable flag
  console.log('🔄 Running yarn install...');
  try {
    execSync('yarn install', { stdio: 'inherit' });
    console.log('✅ Yarn install completed successfully');
  } catch (installError) {
    console.error(`❌ Yarn install failed: ${installError.message}`);
    
    // Fallback: Add the NX packages explicitly
    console.log('🛟 Attempting fallback installation of NX packages...');
    for (const pkg of requiredPackages) {
      try {
        // First remove to avoid conflicts
        execSync(`yarn remove ${pkg}`, { stdio: 'pipe' });
        // Then add with specific version
        execSync(`yarn add ${pkg}@${nxVersion} -D`, { stdio: 'inherit' });
        console.log(`✅ Added ${pkg}@${nxVersion}`);
      } catch (addError) {
        console.warn(`⚠️ Could not add ${pkg}: ${addError.message}`);
      }
    }
  }
  
  // 4. Verify package resolution
  console.log('🔍 Verifying NX package resolution...');
  let resolutionErrors = [];
  for (const pkg of requiredPackages) {
    try {
      execSync(`yarn why ${pkg}`, { stdio: 'pipe' });
      console.log(`✅ ${pkg} is properly resolved`);
    } catch (whyError) {
      console.warn(`⚠️ ${pkg} still has resolution issues`);
      resolutionErrors.push(pkg);
    }
  }
  
  if (resolutionErrors.length > 0) {
    console.warn(`⚠️ ${resolutionErrors.length} packages still have resolution issues. Build may fail.`);
  }

  console.log('✅ Yarn 4.4.0 prepared for Vercel deployment!');
} catch (error) {
  console.error('❌ Error preparing Yarn for Vercel:', error.message);
  process.exit(1);
}

// Helper function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
} 