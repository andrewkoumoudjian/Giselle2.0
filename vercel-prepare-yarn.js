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

  // Special handling for Yarn 4.4.0 lockfile issues
  // If we have a yarn.lock, check if we need to modify it directly
  const yarnLockPath = path.join(process.cwd(), 'yarn.lock');
  if (fs.existsSync(yarnLockPath)) {
    console.log('🔍 Checking yarn.lock for NX package references...');
    
    // 1. First try the proper way - running yarn install
    try {
      console.log('🔄 Running yarn install to update lockfile...');
      execSync('yarn install', { stdio: 'inherit' });
    } catch (installError) {
      console.warn(`⚠️ Yarn install encountered an issue: ${installError.message}`);
      
      // 2. If install fails, try reinstalling just the problematic packages
      for (const pkg of requiredPackages) {
        try {
          console.log(`🔄 Reinstalling ${pkg}@${nxVersion}...`);
          
          // Try removing first (ignore errors if it doesn't exist)
          try {
            execSync(`yarn remove ${pkg}`, { stdio: 'pipe' });
          } catch (e) {
            // Ignore remove errors
          }
          
          // Then add it back
          execSync(`yarn add ${pkg}@${nxVersion} -D`, { stdio: 'inherit' });
        } catch (pkgError) {
          console.warn(`⚠️ Failed to reinstall ${pkg}: ${pkgError.message}`);
        }
      }
    }
    
    // 3. Check if our install resolved the issues
    let stillMissingPackages = false;
    for (const pkg of requiredPackages) {
      try {
        execSync(`yarn why ${pkg}`, { stdio: 'pipe' });
        console.log(`✅ ${pkg} is properly resolved`);
      } catch (whyError) {
        console.warn(`⚠️ ${pkg} still has resolution issues, will need manual intervention`);
        stillMissingPackages = true;
      }
    }
    
    if (stillMissingPackages) {
      // 4. Create a minimal package.json with just the problematic packages
      console.log('🛠️ Creating temporary project to generate clean lockfile...');
      const tempDir = path.join(process.cwd(), 'temp-nx-fix');
      ensureDirectoryExists(tempDir);
      
      const tempPackageJson = {
        name: "nx-temp",
        version: "1.0.0",
        private: true,
        dependencies: {}
      };
      
      // Add all NX packages
      for (const pkg of requiredPackages) {
        tempPackageJson.dependencies[pkg] = nxVersion;
      }
      
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2));
      
      // Generate a clean lockfile for these packages
      try {
        console.log('🔄 Generating clean lockfile for NX packages...');
        execSync('yarn install', { cwd: tempDir, stdio: 'inherit' });
        
        // Merge the clean lockfile with our project's lockfile
        if (fs.existsSync(path.join(tempDir, 'yarn.lock'))) {
          console.log('🔄 Merging clean lockfile entries into main project...');
          const cleanLockfile = fs.readFileSync(path.join(tempDir, 'yarn.lock'), 'utf8');
          
          // Extract clean entries
          const cleanEntries = {};
          for (const pkg of requiredPackages) {
            const pkgPattern = new RegExp(`"${pkg.replace('/', '\\/')}@npm:${nxVersion.replace('.', '\\.')}[^"]*"[\\s\\S]*?(?=\\n\\n|$)`, 'g');
            const matches = cleanLockfile.match(pkgPattern);
            if (matches) {
              matches.forEach(match => {
                const key = match.split('\n')[0].replace(/"/g, '').trim();
                cleanEntries[key] = match;
              });
            }
          }
          
          // Add clean entries to main lockfile
          if (Object.keys(cleanEntries).length > 0) {
            let mainLockfile = fs.readFileSync(yarnLockPath, 'utf8');
            mainLockfile += '\n\n# Added by vercel-prepare-yarn.js\n';
            
            for (const entry of Object.values(cleanEntries)) {
              mainLockfile += `\n${entry}\n`;
            }
            
            fs.writeFileSync(yarnLockPath, mainLockfile);
            console.log('✅ Updated yarn.lock with clean NX package entries');
          }
        }
      } catch (tempError) {
        console.error(`❌ Failed to generate clean lockfile: ${tempError.message}`);
      }
      
      // Clean up temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (rmError) {
        console.warn(`⚠️ Failed to remove temp directory: ${rmError.message}`);
      }
    }
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