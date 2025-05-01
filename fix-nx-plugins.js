#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Running Nx plugins fix script...');

// Get the Nx version from package.json
let nxVersion = '22.10.2'; // Default fallback
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies.nx) {
    nxVersion = packageJson.dependencies.nx;
  } else if (packageJson.devDependencies && packageJson.devDependencies.nx) {
    nxVersion = packageJson.devDependencies.nx;
  }
  console.log(`📊 Detected Nx version: ${nxVersion}`);
} catch (error) {
  console.warn(`⚠️ Could not detect Nx version from package.json: ${error.message}`);
  console.log(`📊 Using default Nx version: ${nxVersion}`);
}

// List of required Nx plugins
const requiredPlugins = [
  '@nx/js',
  '@nx/eslint',
  '@nx/eslint-plugin',
  '@nx/jest',
  '@nx/node',
  '@nx/react',
  '@nx/vite',
  '@nx/web'
];

// Function to detect package manager
const detectPackageManager = () => {
  if (fs.existsSync('./yarn.lock')) {
    return 'yarn';
  } else if (fs.existsSync('./package-lock.json')) {
    return 'npm';
  } else if (fs.existsSync('./pnpm-lock.yaml')) {
    return 'pnpm';
  }
  return 'yarn'; // Default to yarn for this project
};

const packageManager = detectPackageManager();
console.log(`📦 Detected package manager: ${packageManager}`);

// Function to install a plugin
const installPlugin = (plugin) => {
  console.log(`📦 Installing ${plugin}@${nxVersion}...`);

  try {
    // First, check if the plugin is already installed in package.json
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };

    if (allDeps[plugin] && allDeps[plugin].includes(nxVersion)) {
      console.log(`✅ ${plugin}@${nxVersion} is already in package.json`);
      return true;
    }

    // Try to fix the lockfile first by running yarn install
    if (packageManager === 'yarn') {
      try {
        console.log(`🔧 Attempting to fix lockfile for ${plugin}...`);
        
        // Add the plugin to resolutions to ensure it's available
        if (!packageJson.resolutions) {
          packageJson.resolutions = {};
        }
        packageJson.resolutions[plugin] = nxVersion;
        fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
        
        // Run yarn install to update the lockfile
        execSync('yarn install', { stdio: 'inherit' });
        console.log(`✅ Successfully updated lockfile for ${plugin}`);
        return true;
      } catch (yarnError) {
        console.warn(`⚠️ Could not update lockfile: ${yarnError.message}`);
      }
    }

    // If yarn install didn't work, try direct installation
    try {
      if (packageManager === 'yarn') {
        execSync(`yarn add ${plugin}@${nxVersion} --dev`, { stdio: 'inherit' });
      } else if (packageManager === 'npm') {
        execSync(`npm install ${plugin}@${nxVersion} --save-dev`, { stdio: 'inherit' });
      } else if (packageManager === 'pnpm') {
        execSync(`pnpm add ${plugin}@${nxVersion} --save-dev`, { stdio: 'inherit' });
      }
      console.log(`✅ Successfully installed ${plugin}@${nxVersion}`);
      return true;
    } catch (installError) {
      console.error(`❌ Failed to install ${plugin}@${nxVersion}: ${installError.message}`);
      
      // Last resort: Add to package.json and run yarn install
      try {
        const updatedPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        if (!updatedPackageJson.devDependencies) {
          updatedPackageJson.devDependencies = {};
        }
        updatedPackageJson.devDependencies[plugin] = `^${nxVersion}`;
        fs.writeFileSync('./package.json', JSON.stringify(updatedPackageJson, null, 2) + '\n');
        
        console.log(`📝 Added ${plugin}@${nxVersion} to package.json, running install...`);
        execSync(`${packageManager} install`, { stdio: 'inherit' });
        console.log(`✅ Successfully installed ${plugin} via package.json update`);
        return true;
      } catch (lastError) {
        console.error(`❌ All installation methods failed for ${plugin}: ${lastError.message}`);
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error installing ${plugin}: ${error.message}`);
    return false;
  }
};

try {
  console.log('🧩 Checking if plugins need to be installed...');

  // Add all required plugins to resolutions in package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (!packageJson.resolutions) {
      packageJson.resolutions = {};
    }

    let resolutionsUpdated = false;
    for (const plugin of requiredPlugins) {
      if (!packageJson.resolutions[plugin] || packageJson.resolutions[plugin] !== nxVersion) {
        packageJson.resolutions[plugin] = nxVersion;
        resolutionsUpdated = true;
      }
    }

    if (resolutionsUpdated) {
      console.log('📝 Updating resolutions in package.json...');
      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
    }
  } catch (error) {
    console.warn(`⚠️ Could not update resolutions in package.json: ${error.message}`);
  }

  // Try running yarn install first to see if that resolves the missing dependencies
  try {
    console.log('🔄 Running yarn install to update lockfile...');
    execSync('yarn install', { stdio: 'inherit' });
    console.log('✅ Yarn install completed successfully');
  } catch (error) {
    console.warn(`⚠️ Yarn install failed, will try individual package installations: ${error.message}`);
    
    // Install all required plugins individually
    for (const plugin of requiredPlugins) {
      installPlugin(plugin);
    }
  }

  console.log('✅ Nx plugins fix completed successfully');
} catch (error) {
  console.error('❌ Error in Nx plugins fix script:', error);
  process.exit(1);
}
