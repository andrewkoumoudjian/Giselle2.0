#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message) {
  console.log(`[vercel-build-helper] ${message}`);
}

function error(message) {
  console.error(`[vercel-build-helper] ERROR: ${message}`);
}

function setupNpmRegistry() {
  log('Setting up npm registry');
  
  // Create .npmrc if it doesn't exist
  if (!fs.existsSync('.npmrc')) {
    fs.writeFileSync('.npmrc', 'network-timeout=600000\nregistry=https://registry.npmjs.org/\n');
    log('Created .npmrc file with network timeout setting');
  }
}

function checkYarnVersion() {
  try {
    const yarnVersion = execSync('yarn --version').toString().trim();
    log(`Current Yarn version: ${yarnVersion}`);
    return yarnVersion;
  } catch (err) {
    error(`Could not detect Yarn version: ${err.message}`);
    return null;
  }
}

function cleanYarnNpmMetadataCache() {
  try {
    // Get the global Yarn folder
    const globalFolder = execSync('yarn config get globalFolder').toString().trim();
    const npmMetadataPath = path.join(globalFolder, 'metadata', 'npm');
    
    if (fs.existsSync(npmMetadataPath)) {
      log(`Cleaning Yarn's npm metadata cache at ${npmMetadataPath}`);
      execSync(`rm -rf "${npmMetadataPath}"`);
      log('Successfully cleaned Yarn npm metadata cache');
    } else {
      log(`Yarn npm metadata path does not exist at ${npmMetadataPath}, skipping cleanup`);
    }
  } catch (err) {
    error(`Failed to clean Yarn npm metadata cache: ${err.message}`);
  }
}

function ensureLockfileExists() {
  if (!fs.existsSync('yarn.lock')) {
    log('yarn.lock does not exist, creating a new one');
    try {
      execSync('touch yarn.lock');
    } catch (err) {
      error(`Failed to create yarn.lock: ${err.message}`);
    }
  } else {
    log('yarn.lock exists');
  }
}

function ensureYarnReleasesDir() {
  const releasesDir = '.yarn/releases';
  
  if (!fs.existsSync(releasesDir)) {
    log(`${releasesDir} directory does not exist, creating it`);
    try {
      fs.mkdirSync(releasesDir, { recursive: true });
      log(`Created ${releasesDir} directory`);
    } catch (err) {
      error(`Failed to create ${releasesDir} directory: ${err.message}`);
    }
  } else {
    log(`${releasesDir} directory exists`);
  }
  
  const yarnReleasePath = path.join(releasesDir, 'yarn-4.4.0.cjs');
  if (!fs.existsSync(yarnReleasePath)) {
    log(`Yarn release file not found at ${yarnReleasePath}, will be downloaded during install`);
  } else {
    log(`Found Yarn release file at ${yarnReleasePath}`);
  }
}

function updatePackageJsonResolutions() {
  log('Updating package.json resolutions for Nx plugins');
  
  try {
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.resolutions) {
      packageJson.resolutions = {};
    }
    
    // Update resolutions for Nx packages
    const nxVersion = '22.10.2';
    const nxPackages = [
      '@nx/eslint-plugin',
      '@nx/eslint',
      '@nx/jest',
      '@nx/js',
      '@nx/node',
      '@nx/react',
      '@nx/storybook',
      '@nx/vite',
      '@nx/web',
      'nx'
    ];
    
    let updated = false;
    for (const pkg of nxPackages) {
      if (packageJson.resolutions[pkg] !== nxVersion) {
        packageJson.resolutions[pkg] = nxVersion;
        updated = true;
        log(`Updated resolution: ${pkg} -> ${nxVersion}`);
      }
    }
    
    if (updated) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log('Successfully updated package.json resolutions');
    } else {
      log('All resolutions already up to date');
    }
  } catch (err) {
    error(`Failed to update package.json resolutions: ${err.message}`);
  }
}

function verifyNxDependencies() {
  log('Verifying NX dependencies in yarn.lock');
  
  try {
    if (!fs.existsSync('yarn.lock')) {
      error('yarn.lock not found');
      return false;
    }
    
    const yarnLockContent = fs.readFileSync('yarn.lock', 'utf8');
    
    // In Yarn 4, the format might vary. Check multiple possible formats.
    const nxPackages = [
      // Check both formats that might appear in yarn.lock
      { name: '@nx/js', version: '22.10.2' },
      { name: '@nx/eslint', version: '22.10.2' },
      { name: '@nx/jest', version: '22.10.2' },
      { name: '@nx/node', version: '22.10.2' },
      { name: '@nx/react', version: '22.10.2' },
      { name: '@nx/vite', version: '22.10.2' },
      { name: '@nx/web', version: '22.10.2' },
      { name: '@nx/storybook', version: '22.10.2' },
      { name: '@nx/eslint-plugin', version: '22.10.2' },
      { name: 'nx', version: '22.10.2' }
    ];
    
    let missingPackages = [];
    for (const pkg of nxPackages) {
      // Different patterns that might be used in yarn.lock
      const patterns = [
        `"${pkg.name}@npm:${pkg.version}"`, // Exact pattern with npm prefix
        `"${pkg.name}@${pkg.version}"`,    // Without npm prefix
        `${pkg.name}@${pkg.version}`,      // Without quotes
        `${pkg.name}@npm:${pkg.version}`   // With npm prefix but no quotes
      ];
      
      const found = patterns.some(pattern => yarnLockContent.includes(pattern));
      if (!found) {
        missingPackages.push(`${pkg.name}@${pkg.version}`);
      }
    }
    
    if (missingPackages.length === 0) {
      log('All NX packages found in yarn.lock');
      return true;
    } else {
      log(`Missing packages in yarn.lock: ${missingPackages.join(', ')}`);
      return false;
    }
  } catch (err) {
    error(`Error verifying NX dependencies: ${err.message}`);
    return false;
  }
}

function installNxPackages() {
  const nxPackages = [
    '@nx/js@22.10.2',
    '@nx/eslint@22.10.2',
    '@nx/jest@22.10.2',
    '@nx/node@22.10.2',
    '@nx/react@22.10.2',
    '@nx/vite@22.10.2',
    '@nx/web@22.10.2',
    '@nx/storybook@22.10.2',
    '@nx/eslint-plugin@22.10.2',
    'nx@22.10.2'
  ];
  
  log('Updating dependency installation for Nx packages');
  
  try {
    // Check if dependencies are already in the lockfile
    const dependenciesInLockfile = verifyNxDependencies();
    
    if (!dependenciesInLockfile) {
      log('Running yarn install to update dependencies');
      execSync('yarn install', { stdio: 'inherit' });
      
      // Verify after installation
      if (!verifyNxDependencies()) {
        log('Adding NX specific resolution entries to force correct versions');
        
        // Get package.json, ensure it has nx packages with correct versions
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check if we need to add packages to devDependencies
        let needsInstall = false;
        if (!packageJson.devDependencies) {
          packageJson.devDependencies = {};
        }
        
        for (const pkgWithVersion of nxPackages) {
          const parts = pkgWithVersion.split('@');
          const pkgName = parts[0] === '' ? '@' + parts[1] : parts[0];
          const version = parts[parts.length - 1];
          
          // Add to devDependencies if missing or wrong version
          if (!packageJson.devDependencies[pkgName] || 
              packageJson.devDependencies[pkgName] !== version) {
            packageJson.devDependencies[pkgName] = version;
            needsInstall = true;
          }
        }
        
        if (needsInstall) {
          fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
          log('Updated package.json with exact NX versions');
          
          log('Running yarn install with updated dependencies');
          execSync('yarn install', { stdio: 'inherit' });
        }
      }
    } else {
      log('All NX packages already in lockfile');
    }
  } catch (err) {
    error(`Failed to install Nx packages: ${err.message}`);
  }
}

function generateLocalNodeModules() {
  log('Ensuring node_modules are properly linked');
  try {
    // This only needs to run on Yarn 4+ with node-modules linker
    execSync('yarn install --mode=update-lockfile', { stdio: 'inherit' });
    log('Successfully generated local node_modules');
  } catch (err) {
    error(`Failed to generate local node_modules: ${err.message}`);
  }
}

// Main execution
try {
  log('Starting vercel-build-helper script');
  
  setupNpmRegistry();
  const yarnVersion = checkYarnVersion();
  cleanYarnNpmMetadataCache();
  
  if (yarnVersion && yarnVersion.startsWith('4.')) {
    log('Detected Yarn 4+, ensuring lockfile requirements are met');
    ensureLockfileExists();
    ensureYarnReleasesDir();
  }
  
  updatePackageJsonResolutions();
  installNxPackages();
  generateLocalNodeModules();
  
  log('vercel-build-helper script completed successfully');
} catch (err) {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
}